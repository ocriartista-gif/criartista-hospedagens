create or replace function private.prevent_gallery_asset_delete_when_used()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
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

  return old;
end;
$$;

drop trigger if exists gallery_images_prevent_delete_when_used
on public.gallery_images;

create trigger gallery_images_prevent_delete_when_used
before delete on public.gallery_images
for each row
execute function private.prevent_gallery_asset_delete_when_used();
