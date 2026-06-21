alter table customer_orders
  add column if not exists delivery_address text,
  add column if not exists customer_notes text,
  add column if not exists container_count int not null default 0,
  add column if not exists large_container_count int not null default 0,
  add column if not exists extra_handling_fee numeric(12, 2) not null default 0;

alter table delivery_slots
  add column if not exists max_orders_per_day int not null default 48;

create table if not exists pilot_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists order_feedback (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references customer_orders(id) on delete cascade,
  order_number text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create unique index if not exists order_feedback_order_number_idx on order_feedback(order_number);

alter table pilot_settings enable row level security;
alter table order_feedback enable row level security;

create policy "service role owns pilot settings"
on pilot_settings for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role owns order feedback"
on order_feedback for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

insert into pilot_settings (key, value)
values
  ('whatsappNumber', '"+26775909515"'::jsonb),
  ('studentDeliveryFee', '30'::jsonb),
  ('refillPricePerLitre', '1.6'::jsonb),
  ('extraHandlingFee', '5'::jsonb),
  ('defaultSlotCapacity', '48'::jsonb),
  ('pilotActive', 'true'::jsonb),
  ('orderCutoffMessage', '"Fresh Water Market ordering is paused for today. Please check back for the next delivery window."'::jsonb)
on conflict (key) do nothing;
