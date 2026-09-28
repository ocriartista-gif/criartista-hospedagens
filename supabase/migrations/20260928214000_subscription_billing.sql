create table public.checkout_intents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  property_name text not null check (length(trim(property_name)) between 2 and 120),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'BRL' check (currency = 'BRL'),
  provider_subscription_id text unique,
  checkout_url text,
  status text not null default 'pending' check (status in ('pending','paid','canceled')),
  created_at timestamptz not null default now()
);
create index checkout_intents_owner_idx on public.checkout_intents(owner_id, created_at desc);
create unique index checkout_intents_one_pending_per_owner on public.checkout_intents(owner_id) where status = 'pending';
alter table public.checkout_intents enable row level security;
grant select on public.checkout_intents to authenticated;
grant select, insert, update on public.checkout_intents to service_role;
create policy "owner_reads_checkout" on public.checkout_intents for select to authenticated
using (owner_id = (select auth.uid()));

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  property_id uuid unique references public.properties(id) on delete restrict,
  owner_id uuid not null references auth.users(id) on delete restrict,
  checkout_intent_id uuid not null unique references public.checkout_intents(id) on delete restrict,
  provider text not null default 'mercado_pago',
  external_subscription_id text not null unique,
  status text not null default 'pending'
    check (status in ('pending','active','past_due','suspended','canceled')),
  plan_code text not null default 'complete',
  amount numeric(12,2) not null,
  currency text not null default 'BRL',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
grant select on public.subscriptions to authenticated;
grant select, insert, update on public.subscriptions to service_role;
create policy "owner_reads_subscription" on public.subscriptions for select to authenticated
using (owner_id = (select auth.uid()));

create table public.billing_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  external_event_id text not null,
  resource_id text not null,
  event_type text not null,
  status text not null default 'pending' check (status in ('pending','processed','ignored')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, external_event_id)
);
alter table public.billing_webhook_events enable row level security;
revoke all on public.billing_webhook_events from anon, authenticated;
grant select, insert, update on public.billing_webhook_events to service_role;

-- No client may alter subscriptions, payment status or provisioning events.
-- Service-role access bypasses RLS; the key must stay server-side.
