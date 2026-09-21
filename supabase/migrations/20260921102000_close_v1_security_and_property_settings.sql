drop policy if exists "public_create_leads" on public.leads;
create policy "public_create_leads"
on public.leads for insert to anon
with check (
  exists (
    select 1 from public.properties p
    where p.id = leads.property_id and p.status = 'active'
  )
  and (
    accommodation_id is null
    or exists (
      select 1 from public.accommodations a
      where a.id = leads.accommodation_id
        and a.property_id = leads.property_id
        and a.published
    )
  )
);

drop policy if exists "commercial_team_add_lead_activities" on public.lead_activities;
create policy "commercial_team_add_lead_activities"
on public.lead_activities for insert to authenticated
with check (
  private.has_property_role(
    property_id,
    array['owner','manager','reservations','technical_admin']::text[]
  )
  and exists (
    select 1 from public.leads l
    where l.id = lead_activities.lead_id
      and l.property_id = lead_activities.property_id
  )
  and (actor_user_id is null or actor_user_id = (select auth.uid()))
);

alter table public.properties
  add column if not exists check_in_time time not null default '15:00',
  add column if not exists check_out_time time not null default '12:00',
  add column if not exists children_policy text,
  add column if not exists pets_policy text,
  add column if not exists cancellation_policy text,
  add column if not exists maps_url text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='leads_valid_stay_dates'
  ) then
    alter table public.leads
      add constraint leads_valid_stay_dates
      check (check_in is null or check_out is null or check_out > check_in)
      not valid;
  end if;
end $$;

create index if not exists property_theme_history_changed_by_idx
  on public.property_theme_history(changed_by);
