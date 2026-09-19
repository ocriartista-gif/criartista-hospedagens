alter table property_members
  add column if not exists display_name text,
  add column if not exists email text;

update property_members pm
set
  display_name = coalesce(pm.display_name, split_part(u.email, '@', 1)),
  email = coalesce(pm.email, u.email)
from auth.users u
where u.id = pm.user_id;

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  activity_type text not null,
  title text not null,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lead_activities_lead_created_idx
  on lead_activities(lead_id, created_at desc);

create index if not exists lead_activities_property_created_idx
  on lead_activities(property_id, created_at desc);

alter table lead_activities enable row level security;

grant select, insert on lead_activities to authenticated;

create policy "commercial_team_view_lead_activities"
on lead_activities for select
to authenticated
using (
  private.has_property_role(
    property_id,
    array['owner','manager','reservations','technical_admin']::text[]
  )
);

create policy "commercial_team_add_lead_activities"
on lead_activities for insert
to authenticated
with check (
  private.has_property_role(
    property_id,
    array['owner','manager','reservations','technical_admin']::text[]
  )
  and exists (
    select 1
    from leads l
    where l.id = lead_id
      and l.property_id = property_id
  )
  and (actor_user_id is null or actor_user_id = (select auth.uid()))
);

create or replace function private.log_lead_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.lead_activities (
    property_id,
    lead_id,
    actor_user_id,
    activity_type,
    title,
    description,
    metadata,
    created_at
  )
  values (
    new.property_id,
    new.id,
    auth.uid(),
    'lead_created',
    'Lead recebido',
    case
      when new.source is not null then 'Origem: ' || new.source
      else 'Lead criado no sistema'
    end,
    jsonb_build_object(
      'source', new.source,
      'medium', new.medium,
      'campaign', new.campaign,
      'status', new.status,
      'check_in', new.check_in,
      'check_out', new.check_out
    ),
    new.created_at
  );

  return new;
end;
$$;

create or replace function private.log_lead_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
begin
  if old.status is distinct from new.status then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'status_change',
      'Status atualizado',
      coalesce(old.status, '—') || ' → ' || coalesce(new.status, '—'),
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  if old.quoted_value is distinct from new.quoted_value then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'quote',
      case when new.quoted_value is null then 'Cotação removida' else 'Cotação atualizada' end,
      case
        when new.quoted_value is null then null
        else 'Valor cotado: R$ ' || to_char(new.quoted_value, 'FM999G999G990D00')
      end,
      jsonb_build_object('from', old.quoted_value, 'to', new.quoted_value)
    );
  end if;

  if old.last_contact is distinct from new.last_contact and new.last_contact is not null then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'contact',
      'Contato registrado',
      'Último contato atualizado',
      jsonb_build_object('contact_at', new.last_contact)
    );
  end if;

  if old.next_follow_up is distinct from new.next_follow_up then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'follow_up',
      case when new.next_follow_up is null then 'Follow-up removido' else 'Follow-up agendado' end,
      null,
      jsonb_build_object('from', old.next_follow_up, 'to', new.next_follow_up)
    );
  end if;

  if old.scheduled_contact_at is distinct from new.scheduled_contact_at
     or old.scheduled_contact_note is distinct from new.scheduled_contact_note then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'scheduled_contact',
      case
        when new.scheduled_contact_at is null then 'Contato marcado removido'
        else 'Contato marcado com hóspede'
      end,
      new.scheduled_contact_note,
      jsonb_build_object(
        'from', old.scheduled_contact_at,
        'to', new.scheduled_contact_at,
        'note', new.scheduled_contact_note
      )
    );
  end if;

  if old.assigned_to is distinct from new.assigned_to then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'assignment',
      case when new.assigned_to is null then 'Responsável removido' else 'Responsável alterado' end,
      null,
      jsonb_build_object('from', old.assigned_to, 'to', new.assigned_to)
    );
  end if;

  if old.notes is distinct from new.notes and new.notes is not null then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'note_update',
      'Observações comerciais atualizadas',
      new.notes,
      '{}'::jsonb
    );
  end if;

  if old.lost_reason is distinct from new.lost_reason and new.lost_reason is not null then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'lost_reason',
      'Motivo da perda registrado',
      new.lost_reason,
      '{}'::jsonb
    );
  end if;

  if old.do_not_contact is distinct from new.do_not_contact then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'contact_permission',
      case when new.do_not_contact then 'Lead marcado como não contatar' else 'Contato liberado novamente' end,
      null,
      jsonb_build_object('do_not_contact', new.do_not_contact)
    );
  end if;

  if old.priority_override is distinct from new.priority_override then
    insert into public.lead_activities (
      property_id, lead_id, actor_user_id, activity_type, title, description, metadata
    )
    values (
      new.property_id,
      new.id,
      v_actor,
      'priority_override',
      'Prioridade manual atualizada',
      case
        when new.priority_override is null then 'Prioridade manual removida'
        else 'Acréscimo manual: ' || new.priority_override::text
      end,
      jsonb_build_object('from', old.priority_override, 'to', new.priority_override)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_log_lead_created on leads;
create trigger trg_log_lead_created
after insert on leads
for each row execute function private.log_lead_created();

drop trigger if exists trg_log_lead_changes on leads;
create trigger trg_log_lead_changes
after update on leads
for each row execute function private.log_lead_changes();

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
  'lead_created',
  'Lead recebido',
  case when l.source is not null then 'Origem: ' || l.source else 'Lead criado no sistema' end,
  jsonb_build_object(
    'source', l.source,
    'medium', l.medium,
    'campaign', l.campaign,
    'status', l.status,
    'check_in', l.check_in,
    'check_out', l.check_out
  ),
  l.created_at
from leads l
where not exists (
  select 1
  from lead_activities a
  where a.lead_id = l.id
    and a.activity_type = 'lead_created'
);

update leads
set assigned_to = (
  select pm.user_id
  from property_members pm
  where pm.property_id = leads.property_id
    and pm.role in ('owner','manager','reservations','technical_admin')
  order by
    case pm.role
      when 'reservations' then 1
      when 'manager' then 2
      when 'owner' then 3
      else 4
    end,
    pm.created_at
  limit 1
)
where assigned_to is null
  and status not in ('reservado','perdido');
