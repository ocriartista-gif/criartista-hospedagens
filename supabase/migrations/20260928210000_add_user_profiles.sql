-- Perfil global independente de uma hospedagem.
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  phone text,
  avatar_path text,
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length check (char_length(display_name) <= 120),
  constraint profiles_phone_length check (char_length(phone) <= 30)
);

insert into public.profiles (user_id, display_name)
select distinct on (user_id) user_id, coalesce(display_name, '')
from public.property_members
order by user_id, (nullif(trim(display_name), '') is null), created_at;

alter table public.profiles enable row level security;
grant select, insert, update on public.profiles to authenticated;

create policy "read_own_profile" on public.profiles for select to authenticated
using (user_id = (select auth.uid()));
create policy "insert_own_profile" on public.profiles for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "update_own_profile" on public.profiles for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-avatars', 'profile-avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set file_size_limit = excluded.file_size_limit,
allowed_mime_types = excluded.allowed_mime_types;

create policy "upload_own_avatar" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "update_own_avatar" on storage.objects for update to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "delete_own_avatar" on storage.objects for delete to authenticated
using (bucket_id = 'profile-avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
