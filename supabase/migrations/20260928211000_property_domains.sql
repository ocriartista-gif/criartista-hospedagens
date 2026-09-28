create table public.property_domains (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  domain text not null unique,
  type text not null check (type in ('subdomain', 'custom')),
  is_primary boolean not null default false,
  status text not null default 'pending' check (status in ('pending', 'verified', 'disabled')),
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  constraint property_domains_lowercase check (domain = lower(domain)),
  constraint property_domains_valid check (domain ~ '^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$' and length(domain) <= 253)
);
create unique index property_domains_one_primary on public.property_domains(property_id) where is_primary;
create index property_domains_property_idx on public.property_domains(property_id);

-- O endereço automático da hospedagem atual continua disponível após a migration.
insert into public.property_domains (property_id, domain, type, is_primary, status, verification_status, verified_at)
select id, slug || '.hospedagens.ocriartista.site', 'subdomain', true, 'verified', 'verified', now()
from public.properties
on conflict (domain) do nothing;

alter table public.property_domains enable row level security;
grant select on public.property_domains to anon, authenticated;
grant insert, update, delete on public.property_domains to authenticated;
create policy "public_verified_domains" on public.property_domains for select to anon, authenticated
using (status = 'verified' and verification_status = 'verified'
  and exists (select 1 from public.properties p where p.id = property_id and p.status = 'active'));
create policy "members_view_domains" on public.property_domains for select to authenticated
using (private.is_property_member(property_id));
-- A criação e verificação de domínios serão feitas por uma função de servidor privilegiada,
-- após checar ownership e posse DNS. Nenhum cliente pode autoverificar seu domínio por RLS.
