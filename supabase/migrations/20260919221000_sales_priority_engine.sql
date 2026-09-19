-- CRM comercial: prioridade explicável e fila diária.

alter table properties
  add column if not exists timezone text not null default 'America/Sao_Paulo';

alter table leads
  add column if not exists scheduled_contact_at timestamptz,
  add column if not exists scheduled_contact_note text,
  add column if not exists lost_reason text,
  add column if not exists do_not_contact boolean not null default false,
  add column if not exists priority_override integer;

alter table leads
  drop constraint if exists leads_priority_override_check;

alter table leads
  add constraint leads_priority_override_check
  check (priority_override is null or priority_override between 0 and 100);

create index if not exists leads_next_follow_up_idx
  on leads(property_id, next_follow_up)
  where next_follow_up is not null;

create index if not exists leads_scheduled_contact_idx
  on leads(property_id, scheduled_contact_at)
  where scheduled_contact_at is not null;

create index if not exists leads_check_in_idx
  on leads(property_id, check_in)
  where check_in is not null;

drop view if exists lead_priority_queue;

create view lead_priority_queue
with (security_invoker = true)
as
with normalized as (
  select
    l.*,
    p.timezone as property_timezone,
    (now() at time zone p.timezone)::date as local_today,
    case
      when l.check_in is not null
           and l.check_in < (now() at time zone p.timezone)::date
      then
        case
          when (
            l.check_in
            + make_interval(
                years => extract(year from (now() at time zone p.timezone))::int
                       - extract(year from l.check_in)::int
              )
          )::date >= (now() at time zone p.timezone)::date
          then (
            l.check_in
            + make_interval(
                years => extract(year from (now() at time zone p.timezone))::int
                       - extract(year from l.check_in)::int
              )
          )::date
          else (
            l.check_in
            + make_interval(
                years => extract(year from (now() at time zone p.timezone))::int
                       - extract(year from l.check_in)::int + 1
              )
          )::date
        end
      else null
    end as next_seasonal_date
  from leads l
  join properties p on p.id = l.property_id
),
scored as (
  select
    n.*,
    greatest(
      0,
      coalesce(n.priority_override, 0)
      +
      case when n.do_not_contact then -1000 else
        case
          when n.scheduled_contact_at is not null and n.scheduled_contact_at <= now() then 75
          when n.scheduled_contact_at is not null and n.scheduled_contact_at <= now() + interval '24 hours' then 55
          else 0
        end
        +
        case
          when n.next_follow_up is not null and n.next_follow_up <= now() then 65
          when n.next_follow_up is not null and n.next_follow_up <= now() + interval '24 hours' then 40
          else 0
        end
        +
        case
          when n.check_in is not null and n.check_in >= n.local_today and n.check_in <= n.local_today + 7 then 50
          when n.check_in is not null and n.check_in > n.local_today + 7 and n.check_in <= n.local_today + 30 then 30
          when n.check_in is not null and n.check_in > n.local_today + 30 and n.check_in <= n.local_today + 60 then 15
          else 0
        end
        +
        case
          when n.status = 'novo' and n.last_contact is null and n.created_at <= now() - interval '72 hours' then 60
          when n.status = 'novo' and n.last_contact is null and n.created_at <= now() - interval '24 hours' then 50
          when n.status = 'novo' and n.last_contact is null then 35
          else 0
        end
        +
        case
          when n.status = 'cotacao_enviada' and coalesce(n.last_contact, n.created_at) <= now() - interval '72 hours' then 35
          when n.status = 'cotacao_enviada' and coalesce(n.last_contact, n.created_at) <= now() - interval '24 hours' then 25
          else 0
        end
        +
        case
          when n.status in ('contatado','follow_up')
               and n.next_follow_up is null
               and n.scheduled_contact_at is null
               and coalesce(n.last_contact, n.created_at) <= now() - interval '72 hours'
            then 20
          else 0
        end
        +
        case
          when n.next_seasonal_date is not null and n.next_seasonal_date between n.local_today and n.local_today + 30 then 40
          when n.next_seasonal_date is not null and n.next_seasonal_date > n.local_today + 30 and n.next_seasonal_date <= n.local_today + 60 then 25
          else 0
        end
        +
        case
          when n.status = 'reservado'
               and n.next_seasonal_date is not null
               and n.next_seasonal_date <= n.local_today + 60
            then 10
          else 0
        end
      end
    )::int as priority_score,

    array_remove(array[
      case when n.do_not_contact then 'Não contatar' end,
      case
        when n.scheduled_contact_at is not null and n.scheduled_contact_at <= now() then 'Contato agendado vencido'
        when n.scheduled_contact_at is not null and n.scheduled_contact_at <= now() + interval '24 hours' then 'Contato agendado nas próximas 24h'
      end,
      case
        when n.next_follow_up is not null and n.next_follow_up <= now() then 'Follow-up vencido'
        when n.next_follow_up is not null and n.next_follow_up <= now() + interval '24 hours' then 'Follow-up nas próximas 24h'
      end,
      case
        when n.check_in is not null and n.check_in >= n.local_today and n.check_in <= n.local_today + 7 then 'Estadia em até 7 dias'
        when n.check_in is not null and n.check_in > n.local_today + 7 and n.check_in <= n.local_today + 30 then 'Estadia em até 30 dias'
        when n.check_in is not null and n.check_in > n.local_today + 30 and n.check_in <= n.local_today + 60 then 'Estadia em até 60 dias'
      end,
      case
        when n.status = 'novo' and n.last_contact is null and n.created_at <= now() - interval '72 hours' then 'Lead novo sem contato há mais de 3 dias'
        when n.status = 'novo' and n.last_contact is null and n.created_at <= now() - interval '24 hours' then 'Lead novo sem contato há mais de 24h'
        when n.status = 'novo' and n.last_contact is null then 'Lead novo sem primeiro contato'
      end,
      case
        when n.status = 'cotacao_enviada' and coalesce(n.last_contact, n.created_at) <= now() - interval '72 hours' then 'Cotação sem retorno há mais de 3 dias'
        when n.status = 'cotacao_enviada' and coalesce(n.last_contact, n.created_at) <= now() - interval '24 hours' then 'Cotação aguardando retorno'
      end,
      case
        when n.status in ('contatado','follow_up')
             and n.next_follow_up is null
             and n.scheduled_contact_at is null
             and coalesce(n.last_contact, n.created_at) <= now() - interval '72 hours'
          then 'Em atendimento sem próximo passo há mais de 3 dias'
      end,
      case
        when n.next_seasonal_date is not null and n.next_seasonal_date between n.local_today and n.local_today + 30 then 'Época de viagem anterior volta em até 30 dias'
        when n.next_seasonal_date is not null and n.next_seasonal_date > n.local_today + 30 and n.next_seasonal_date <= n.local_today + 60 then 'Época de viagem anterior volta em até 60 dias'
      end,
      case
        when n.status = 'reservado'
             and n.next_seasonal_date is not null
             and n.next_seasonal_date <= n.local_today + 60
          then 'Hóspede anterior com potencial de recompra'
      end,
      case
        when n.priority_override is not null and n.priority_override > 0 then 'Prioridade manual'
      end
    ], null) as priority_reasons
  from normalized n
)
select
  s.*,
  case
    when s.do_not_contact then 'bloqueado'
    when s.status not in ('reservado','perdido')
         and (
           s.scheduled_contact_at is not null
           or s.next_follow_up is not null
           or (s.check_in is not null and s.check_in >= s.local_today)
           or s.status in ('novo','cotacao_enviada','follow_up')
           or s.next_seasonal_date is null
         )
      then 'atender'
    when s.next_seasonal_date is not null
         and s.next_seasonal_date <= s.local_today + 60
      then 'reativar'
    when s.status not in ('reservado','perdido') then 'atender'
    else 'nutrir'
  end as queue_type,
  case
    when s.do_not_contact then 'bloqueado'
    when s.priority_score >= 90 then 'urgente'
    when s.priority_score >= 60 then 'alta'
    when s.priority_score >= 30 then 'media'
    else 'baixa'
  end as priority_level
from scored s;

grant select on lead_priority_queue to authenticated;
