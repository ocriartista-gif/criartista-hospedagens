insert into public.gallery_images (
  property_id,
  storage_path,
  alt_text,
  caption,
  category,
  sort_order,
  published
)
select
  a.property_id,
  ai.storage_path,
  ai.alt_text,
  a.name,
  'Acomodações',
  row_number() over (
    partition by a.property_id
    order by a.sort_order, ai.sort_order, ai.id
  )::integer,
  true
from public.accommodation_images ai
join public.accommodations a on a.id = ai.accommodation_id
where not exists (
  select 1
  from public.gallery_images gi
  where gi.property_id = a.property_id
    and gi.storage_path = ai.storage_path
);
