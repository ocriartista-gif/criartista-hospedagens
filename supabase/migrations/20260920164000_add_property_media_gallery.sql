insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'property-media',
  'property-media',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  caption text,
  category text,
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_property_order_idx
  on public.gallery_images(property_id, sort_order, created_at);

alter table public.gallery_images enable row level security;

grant select on public.gallery_images to anon, authenticated;
grant insert, update, delete on public.gallery_images to authenticated;

create policy "public_view_published_gallery"
on public.gallery_images for select to anon
using (
  published
  and exists (
    select 1 from public.properties p
    where p.id = gallery_images.property_id
      and p.status = 'active'
  )
);

create policy "members_view_gallery"
on public.gallery_images for select to authenticated
using (private.is_property_member(property_id));

create policy "content_team_insert_gallery"
on public.gallery_images for insert to authenticated
with check (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "content_team_update_gallery"
on public.gallery_images for update to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
)
with check (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "content_team_delete_gallery"
on public.gallery_images for delete to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "content_team_upload_property_media"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'property-media'
  and private.has_property_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "content_team_update_property_media"
on storage.objects for update to authenticated
using (
  bucket_id = 'property-media'
  and private.has_property_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','manager','marketing','technical_admin']::text[]
  )
)
with check (
  bucket_id = 'property-media'
  and private.has_property_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);

create policy "content_team_delete_property_media"
on storage.objects for delete to authenticated
using (
  bucket_id = 'property-media'
  and private.has_property_role(
    ((storage.foldername(name))[1])::uuid,
    array['owner','manager','marketing','technical_admin']::text[]
  )
);
