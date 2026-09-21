update public.gallery_images
set category = case
  when category is null or btrim(category) = '' then 'Geral'
  when lower(btrim(category)) in ('acomodações','acomodacoes','acomodação','acomodacao') then 'Acomodações'
  when lower(btrim(category)) in ('experiências','experiencias','experiência','experiencia') then 'Experiências'
  when lower(btrim(category)) = 'hero' then 'Hero'
  when lower(btrim(category)) = 'marca' then 'Marca'
  when lower(btrim(category)) = 'favicon' then 'Favicon'
  when lower(btrim(category)) = 'geral' then 'Geral'
  else 'Geral'
end;
