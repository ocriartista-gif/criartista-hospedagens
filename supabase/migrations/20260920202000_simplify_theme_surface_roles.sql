alter table public.property_themes
  add column if not exists cta_surface_key text not null default 'primary';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'property_themes_cta_surface_key_check'
  ) then
    alter table public.property_themes
      add constraint property_themes_cta_surface_key_check
      check (cta_surface_key in ('primary','secondary','accent','background','text'));
  end if;
end $$;

update public.property_themes
set post_hero_surface_key = 'background'
where post_hero_surface_key <> 'background';
