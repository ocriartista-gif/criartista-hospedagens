alter table property_themes
  add column if not exists logo_main_url text,
  add column if not exists logo_light_url text,
  add column if not exists favicon_url text;
