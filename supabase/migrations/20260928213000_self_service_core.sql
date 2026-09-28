-- Provisioning is one database transaction. Only service_role may call the RPC.
alter table public.properties drop constraint if exists properties_status_check;
alter table public.properties add constraint properties_status_check
  check (status in ('draft', 'active', 'suspended', 'canceled', 'inactive'));

create table public.onboarding_state (
  property_id uuid primary key references public.properties(id) on delete cascade,
  current_step text not null default 'property',
  completed_steps text[] not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.onboarding_state enable row level security;
grant select, insert, update on public.onboarding_state to authenticated;
create policy "members_read_onboarding" on public.onboarding_state for select to authenticated
using (private.is_property_member(property_id));
create policy "owners_update_onboarding" on public.onboarding_state for update to authenticated
using (private.has_property_role(property_id, array['owner']::text[]))
with check (private.has_property_role(property_id, array['owner']::text[]));

create table public.provisioning_requests (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  source_id text not null,
  property_id uuid unique references public.properties(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (source, source_id),
  check (length(source_id) between 1 and 200)
);
create table public.provisioning_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.provisioning_requests(id) on delete cascade,
  event_type text not null,
  created_at timestamptz not null default now()
);
alter table public.provisioning_requests enable row level security;
alter table public.provisioning_events enable row level security;
revoke all on public.provisioning_requests, public.provisioning_events from anon, authenticated;
grant select, insert, update on public.provisioning_requests to service_role;
grant select, insert on public.provisioning_events to service_role;
grant usage, select on sequence public.provisioning_events_id_seq to service_role;

create or replace function public.provision_property(
  p_source text, p_source_id text, p_owner_id uuid, p_property_name text
) returns uuid language plpgsql security invoker set search_path = ''
as $$
declare
  v_request_id uuid;
  v_property_id uuid;
  v_existing_owner uuid;
  v_slug text;
begin
  if p_source <> 'mercado_pago' or length(trim(p_source_id)) not between 1 and 200
     or length(trim(p_property_name)) not between 2 and 120 then
    raise exception 'Invalid provisioning request';
  end if;
  -- The unique source ID serializes webhook retries. No half-created property commits.
  insert into public.provisioning_requests (source, source_id, owner_id)
  values (p_source, p_source_id, p_owner_id)
  on conflict (source, source_id) do nothing
  returning id into v_request_id;
  if v_request_id is null then
    select property_id, owner_id into v_property_id, v_existing_owner
    from public.provisioning_requests
    where source = p_source and source_id = p_source_id;
    if v_existing_owner is distinct from p_owner_id then
      raise exception 'Provisioning owner mismatch';
    end if;
    if v_property_id is null then raise exception 'Provisioning request incomplete'; end if;
    return v_property_id;
  end if;
  v_slug := trim(both '-' from regexp_replace(lower(trim(p_property_name)), '[^a-z0-9]+', '-', 'g'));
  v_slug := left(coalesce(nullif(v_slug, ''), 'hospedagem'), 48)
    || '-' || left(md5(p_source || ':' || p_source_id), 10);
  insert into public.properties (name, slug, status)
  values (trim(p_property_name), v_slug, 'draft')
  returning id into v_property_id;
  insert into public.property_members (property_id, user_id, role, display_name)
  values (v_property_id, p_owner_id, 'owner', '');
  insert into public.profiles (user_id) values (p_owner_id)
  on conflict (user_id) do nothing;
  insert into public.property_themes (property_id) values (v_property_id);
  insert into public.social_links (property_id) values (v_property_id);
  insert into public.onboarding_state (property_id) values (v_property_id);
  insert into public.content_sections (property_id, section_key, eyebrow, title, description)
  select v_property_id, section_key, eyebrow, title, description
  from (values
    ('hero', 'SUA HOSPEDAGEM', '', ''),
    ('intro', 'BEM-VINDO', '', ''),
    ('accommodations', 'ACOMODAÇÕES', '', ''),
    ('direct_booking', 'RESERVA DIRETA', 'Consulte sua estadia.', ''),
    ('experiences', 'EXPERIÊNCIAS', '', ''),
    ('reviews', 'AVALIAÇÕES', '', ''),
    ('location', 'LOCALIZAÇÃO', '', ''),
    ('footer', '', '', '')
  ) as defaults(section_key, eyebrow, title, description);
  insert into public.integrations (property_id, integration_key, enabled, config)
  select v_property_id, integration_key, false, config::jsonb
  from (values
    ('booking', '{"mode":"criartista"}'),
    ('ga4', '{}'), ('meta_pixel', '{}'), ('gtm', '{}'),
    ('google_sheets', '{}'),
    ('cookie_consent', '{"necessary":true,"analytics":false,"advertising":false}')
  ) as defaults(integration_key, config);
  insert into public.property_domains
    (property_id, domain, type, is_primary, status, verification_status, verified_at)
  values (v_property_id, v_slug || '.hospedagens.ocriartista.site',
    'subdomain', true, 'verified', 'verified', now());
  update public.provisioning_requests
  set property_id = v_property_id, completed_at = now() where id = v_request_id;
  insert into public.provisioning_events (request_id, event_type)
  values (v_request_id, 'property_created');
  return v_property_id;
end;
$$;
revoke all on function public.provision_property(text, text, uuid, text) from public, anon, authenticated;
grant execute on function public.provision_property(text, text, uuid, text) to service_role;

-- Old active sites stay available. Newly provisioned sites remain hidden until
-- an owner supplies the minimum content and explicitly publishes.
create or replace function public.check_property_publication()
returns trigger language plpgsql security invoker set search_path = ''
as $$
begin
  if new.status = old.status then return new; end if;
  if current_setting('request.jwt.claim.role', true) = 'authenticated'
     and (old.status <> 'draft' or new.status <> 'active') then
    raise exception 'Only a draft can be published by its owner';
  end if;
  if new.status = 'active' and (
    nullif(trim(new.name), '') is null
    or nullif(trim(coalesce(new.whatsapp, '')), '') is null
    or nullif(trim(coalesce(new.address, '')), '') is null
    or not exists (
      select 1 from public.content_sections c
      where c.property_id = new.id and c.section_key = 'hero'
      and nullif(trim(coalesce(c.title, '')), '') is not null
      and nullif(c.extra->>'hero_image', '') is not null
    )
    or not exists (
      select 1 from public.accommodations a
      join public.accommodation_images i on i.accommodation_id = a.id
      where a.property_id = new.id and a.published
    )
  ) then
    raise exception 'Complete the minimum details before publishing';
  end if;
  return new;
end;
$$;
create trigger enforce_property_publication before update of status on public.properties
for each row execute function public.check_property_publication();

create or replace function public.set_primary_property_domain(p_property_id uuid, p_domain_id uuid)
returns void language plpgsql security invoker set search_path = ''
as $$
begin
  if not exists (select 1 from public.property_domains
    where id = p_domain_id and property_id = p_property_id and status = 'verified'
      and verification_status = 'verified') then
    raise exception 'Domain is not verified for this property';
  end if;
  update public.property_domains set is_primary = false where property_id = p_property_id and is_primary;
  update public.property_domains set is_primary = true where id = p_domain_id and property_id = p_property_id;
end;
$$;
revoke all on function public.set_primary_property_domain(uuid, uuid) from public, anon, authenticated;
grant execute on function public.set_primary_property_domain(uuid, uuid) to service_role;
