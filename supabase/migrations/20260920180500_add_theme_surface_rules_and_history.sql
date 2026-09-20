alter table public.property_themes
  add column if not exists header_surface_key text not null default 'background',
  add column if not exists post_hero_surface_key text not null default 'background';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'property_themes_header_surface_key_check'
  ) then
    alter table public.property_themes
      add constraint property_themes_header_surface_key_check
      check (header_surface_key in ('primary','secondary','accent','background','text'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'property_themes_post_hero_surface_key_check'
  ) then
    alter table public.property_themes
      add constraint property_themes_post_hero_surface_key_check
      check (post_hero_surface_key in ('primary','secondary','accent','background','text'));
  end if;
end $$;

create table if not exists public.property_theme_history (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  snapshot jsonb not null,
  changed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists property_theme_history_property_created_idx
  on public.property_theme_history(property_id, created_at desc);

alter table public.property_theme_history enable row level security;

grant select, insert, delete on public.property_theme_history to authenticated;

create policy "brand_team_view_theme_history"
on public.property_theme_history for select to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "brand_team_insert_theme_history"
on public.property_theme_history for insert to authenticated
with check (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
  and (changed_by is null or changed_by = (select auth.uid()))
);

create policy "brand_team_delete_theme_history"
on public.property_theme_history for delete to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);
