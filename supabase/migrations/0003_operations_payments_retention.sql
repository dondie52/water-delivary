alter table customer_orders
  add column if not exists payment_reference text,
  add column if not exists payment_confirmed_method text check (payment_confirmed_method in ('cash', 'orange_money', 'bank_transfer')),
  add column if not exists amount_paid numeric(12, 2) not null default 0,
  add column if not exists balance_due numeric(12, 2) generated always as (greatest(total - amount_paid, 0)) stored,
  add column if not exists internal_notes text;

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references customer_orders(id) on delete cascade,
  event_type text not null check (event_type in ('status', 'payment', 'note')),
  from_value text,
  to_value text,
  changed_by text,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists order_status_events_order_created_idx on order_status_events(order_id, created_at desc);
create index if not exists customer_orders_phone_created_idx on customer_orders(phone_number, created_at desc);

alter table order_status_events enable row level security;

create policy "service role owns order events"
on order_status_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
