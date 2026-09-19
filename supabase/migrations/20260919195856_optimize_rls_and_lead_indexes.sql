create index if not exists leads_accommodation_id_idx on leads(accommodation_id);
create index if not exists leads_assigned_to_idx on leads(assigned_to);

drop policy if exists "public_active_properties" on properties;
create policy "public_active_properties"
on properties for select
to anon
using (status = 'active');

drop policy if exists "public_view_themes" on property_themes;
drop policy if exists "members_manage_themes" on property_themes;

create policy "public_view_themes"
on property_themes for select
to anon
using (exists (select 1 from properties p where p.id = property_id and p.status = 'active'));

create policy "members_view_themes"
on property_themes for select
to authenticated
using (private.is_property_member(property_id));

create policy "content_team_insert_themes"
on property_themes for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_update_themes"
on property_themes for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_delete_themes"
on property_themes for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

drop policy if exists "public_view_enabled_content" on content_sections;
drop policy if exists "members_manage_content" on content_sections;

create policy "public_view_enabled_content"
on content_sections for select
to anon
using (
  enabled
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "members_view_all_content"
on content_sections for select
to authenticated
using (private.is_property_member(property_id));

create policy "content_team_insert_content"
on content_sections for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_update_content"
on content_sections for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_delete_content"
on content_sections for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

drop policy if exists "public_view_published_accommodations" on accommodations;
drop policy if exists "content_team_manage_accommodations" on accommodations;

create policy "public_view_published_accommodations"
on accommodations for select
to anon
using (
  published
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "content_team_insert_accommodations"
on accommodations for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_update_accommodations"
on accommodations for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_delete_accommodations"
on accommodations for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

drop policy if exists "public_view_published_accommodation_images" on accommodation_images;
drop policy if exists "content_team_manage_accommodation_images" on accommodation_images;

create policy "public_view_published_accommodation_images"
on accommodation_images for select
to anon
using (
  exists (
    select 1
    from accommodations a
    join properties p on p.id = a.property_id
    where a.id = accommodation_id
      and a.published
      and p.status = 'active'
  )
);

create policy "content_team_insert_accommodation_images"
on accommodation_images for insert
to authenticated
with check (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
);

create policy "content_team_update_accommodation_images"
on accommodation_images for update
to authenticated
using (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
)
with check (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
);

create policy "content_team_delete_accommodation_images"
on accommodation_images for delete
to authenticated
using (
  exists (
    select 1 from accommodations a
    where a.id = accommodation_id
      and private.has_property_role(a.property_id, array['owner','manager','marketing','technical_admin']::text[])
  )
);

drop policy if exists "public_view_published_reviews" on reviews;
drop policy if exists "content_team_manage_reviews" on reviews;

create policy "public_view_published_reviews"
on reviews for select
to anon
using (
  published
  and exists (select 1 from properties p where p.id = property_id and p.status = 'active')
);

create policy "content_team_insert_reviews"
on reviews for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_update_reviews"
on reviews for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_delete_reviews"
on reviews for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

drop policy if exists "owners_manage_integrations" on integrations;

create policy "owners_insert_integrations"
on integrations for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

create policy "owners_update_integrations"
on integrations for update
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

create policy "owners_delete_integrations"
on integrations for delete
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

drop policy if exists "public_view_social_links" on social_links;
drop policy if exists "content_team_manage_social_links" on social_links;

create policy "public_view_social_links"
on social_links for select
to anon
using (exists (select 1 from properties p where p.id = property_id and p.status = 'active'));

create policy "members_view_social_links"
on social_links for select
to authenticated
using (private.is_property_member(property_id));

create policy "content_team_insert_social_links"
on social_links for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_update_social_links"
on social_links for update
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

create policy "content_team_delete_social_links"
on social_links for delete
to authenticated
using (private.has_property_role(property_id, array['owner','manager','marketing','technical_admin']::text[]));

drop policy if exists "owners_manage_property_members" on property_members;

create policy "owners_insert_property_members"
on property_members for insert
to authenticated
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

create policy "owners_update_property_members"
on property_members for update
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]))
with check (private.has_property_role(property_id, array['owner','technical_admin']::text[]));

create policy "owners_delete_property_members"
on property_members for delete
to authenticated
using (private.has_property_role(property_id, array['owner','technical_admin']::text[]));
