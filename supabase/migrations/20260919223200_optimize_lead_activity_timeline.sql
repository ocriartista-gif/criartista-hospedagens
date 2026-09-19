create index if not exists lead_activities_actor_user_id_idx
  on lead_activities(actor_user_id)
  where actor_user_id is not null;

insert into lead_activities (
  property_id,
  lead_id,
  actor_user_id,
  activity_type,
  title,
  description,
  metadata,
  created_at
)
select
  l.property_id,
  l.id,
  null,
  'timeline_started',
  'Histórico comercial ativado',
  'Estado atual: ' || replace(l.status, '_', ' '),
  jsonb_build_object(
    'status', l.status,
    'assigned_to', l.assigned_to,
    'quoted_value', l.quoted_value,
    'last_contact', l.last_contact,
    'next_follow_up', l.next_follow_up
  ),
  now()
from leads l
where not exists (
  select 1
  from lead_activities a
  where a.lead_id = l.id
    and a.activity_type = 'timeline_started'
);
