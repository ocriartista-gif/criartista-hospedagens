drop policy if exists "members_view_integrations" on integrations;

create policy "owners_view_integrations"
on integrations for select
to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','technical_admin']::text[]
  )
);
