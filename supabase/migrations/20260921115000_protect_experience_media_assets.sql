
create or replace function private.prevent_gallery_asset_delete_when_used()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if exists (
    select 1
    from public.accommodation_images ai
    join public.accommodations a on a.id = ai.accommodation_id
    where a.property_id = old.property_id
      and ai.storage_path = old.storage_path
  ) then
    raise exception 'Esta imagem está sendo usada em uma acomodação. Remova-a da acomodação antes de excluí-la da biblioteca.';
  end if;

  if exists (
    select 1
    from public.content_sections cs
    where cs.property_id = old.property_id
      and cs.extra ->> 'hero_image' = old.storage_path
  ) then
    raise exception 'Esta imagem está sendo usada no Hero. Troque a imagem do Hero antes de excluí-la da biblioteca.';
  end if;

  if exists (
    select 1
    from public.content_sections cs
    cross join lateral jsonb_array_elements(
      case
        when jsonb_typeof(cs.extra -> 'items') = 'array'
          then cs.extra -> 'items'
        else '[]'::jsonb
      end
    ) as item
    where cs.property_id = old.property_id
      and cs.section_key = 'experiences'
      and item ->> 'image' = old.storage_path
  ) then
    raise exception 'Esta imagem está sendo usada em uma Experiência. Troque a foto em Conteúdo antes de excluí-la da biblioteca.';
  end if;

  if exists (
    select 1
    from public.property_themes pt
    where pt.property_id = old.property_id
      and old.storage_path in (
        coalesce(pt.logo_main_url, ''),
        coalesce(pt.logo_light_url, ''),
        coalesce(pt.favicon_url, '')
      )
  ) then
    raise exception 'Este arquivo está sendo usado na identidade da marca. Troque-o em Identidade antes de excluí-lo da biblioteca.';
  end if;

  return old;
end;
$function$;
