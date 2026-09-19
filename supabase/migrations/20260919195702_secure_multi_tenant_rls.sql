create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

alter table properties
  add constraint properties_status_check check (status in ('active','inactive'));

alter table leads
  add constraint leads_status_check check (status in ('novo','contatado','cotacao_enviada','follow_up','reservado','perdido'));

alter table property_members
  add constraint property_members_role_check check (role in ('owner','manager','reservations','marketing','technical_admin'));

alter table leads
  add constraint leads_assigned_to_fkey foreign key (assigned_to) references auth.users(id) on delete set null;

create index if not exists content_sections_property_id_idx on content_sections(property_id);
create index if not exists accommodations_property_published_order_idx on accommodations(property_id, published, sort_order);
create index if not exists accommodation_images_accommodation_order_idx on accommodation_images(accommodation_id, sort_order);
create index if not exists reviews_property_published_featured_idx on reviews(property_id, published, featured);
create index if not exists leads_property_status_created_idx on leads(property_id, status, created_at desc);
create index if not exists integrations_property_id_idx on integrations(property_id);
create index if not exists property_members_user_property_idx on property_members(user_id, property_id);

create or replace function private.is_property_member(p_property_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.property_members pm
    where pm.property_id = p_property_id
      and pm.user_id = (select auth.uid())
  );
$$;

create or replace function private.has_property_role(p_property_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.property_members pm
    where pm.property_id = p_property_id
      and pm.user_id = (select auth.uid())
      and pm.role = any(p_roles)
  );
$$;

grant execute on function private.is_property_member(uuid) to authenticated;
grant execute on function private.has_property_role(uuid, text[]) to authenticated;

alter table properties enable row level security;
alter table property_themes enable row level security;
alter table content_sections enable row level security;
alter table accommodations enable row level security;
alter table accommodation_images enable row level security;
alter table reviews enable row level security;
alter table leads enable row level security;
alter table integrations enable row level security;
alter table social_links enable row level security;
alter table property_members enable row level security;

grant select on properties, property_themes, content_sections, accommodations, accommodation_images, reviews, social_links to anon;
grant insert on leads to anon;
grant select, insert, update, delete on properties, property_themes, content_sections, accommodations, accommodation_images, reviews, leads, integrations, social_links, property_members to authenticated;

create policy "public_active_properties"
on properties for select
to anon, authenticated
using (status = 'active');

create policy "members_view_properties"
on properties for select
to authenticated
using (private.is_property_member(id));

create policy "property_admins_update_properties"
on properties for update
to authenticated
using (private.has_property_role(id, array['owner','manager','technical_admin']::text[]))
with check (private.has_property_role(id, array['owner','manager','technical_admin']::text[]));

create policy "property_owners_delete_properties"
on properties for delete
to authenticated
using (private.has_property_role(id, array['owner','technical_admin']::text[]));

create policy "public_view_themes"
on property_themes for select
to anon, authenticated
using (exists (select 1 from properties p where p.id = property_id and p.status = 'active'));

create policy "members_manage_themes"
on property_themes for all
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "public_view_enabled_content"
on content_sections for select
to anon, authenticated
using (
  enabled
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "members_manage_content"
on content_sections for all
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "public_view_published_accommodations"
on accommodations for select
to anon, authenticated
using (
  published
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "members_view_all_accommodations"
on accommodations for select
to authenticated
using (private.is_property_member(property_id));

create policy "content_team_manage_accommodations"
on accommodations for all
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "public_view_published_accommodation_images"
on accommodation_images for select
to anon, authenticated
using (
  exists (
    select 1
    from accommodations a
    join properties p on p.id = a.property_id
    where a.id = accommodation_id
      and a.published
      and p.status = 'active'
  )
);

create policy "members_view_all_accommodation_images"
on accommodation_images for select
to authenticated
using (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.is_property_member(a.property_id)
  )
);

create policy "content_team_manage_accommodation_images"
on accommodation_images for all
to authenticated
using (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
)
with check (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
);

create policy "public_view_published_reviews"
on reviews for select
to anon, authenticated
using (
  published
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "members_view_all_reviews"
on reviews for select
to authenticated
using (private.is_property_member(property_id));

create policy "content_team_manage_reviews"
on reviews for all
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "public_create_leads"
on leads for insert
to anon
with check (
  exists (select 1 from properties p where p.id = property_id and p.status = 'active')
  and (
    accommodation_id is null
    or exists (
      select 1 from accommodations a
      where a.id = accommodation_id
        and a.property_id = property_id
        and a.published
    )
  )
);

create policy "members_view_leads"
on leads for select
to authenticated
using (private.has_property_role(property_id, array['owner','manager','reservations','technical_admin']::text[]));

create policy "members_create_leads"
on leads for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','reservations','technical_admin']::text[]));

create policy "members_update_leads"
on leads for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','reservations','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','reservations','technical_admin']::text[]));

create policy "lead_admins_delete_leads"
on leads for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','technical_admin']::text[]));

create policy "members_view_integrations"
on integrations for select
to authenticated
using (private.is_property_member(property_id));

create policy "owners_manage_integrations"
on integrations for all
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

create policy "public_view_social_links"
on social_links for select
to anon, authenticated
using (exists (select 1 from properties p where p.id = property_id and p.status = 'active'));

create policy "content_team_manage_social_links"
on social_links for all
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "members_view_property_members"
on property_members for select
to authenticated
using (private.is_property_member(property_id));

create policy "owners_manage_property_members"
on property_members for all
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));
