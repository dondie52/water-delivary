create table if not exists staff_sessions (
  id uuid primary key default gen_random_uuid(),
  staff_user_id uuid not null references staff_users(id) on delete cascade,
  session_token_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_seen_at timestamptz
);

create table if not exists app_errors (
  id uuid primary key default gen_random_uuid(),
  route text not null,
  message text not null,
  stack text,
  resolved boolean not null default false,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists qa_checks (
  id uuid primary key default gen_random_uuid(),
  check_key text not null unique,
  label text not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table customer_orders
  add column if not exists requested_fulfillment_date date not null default current_date;

create index if not exists staff_sessions_token_idx on staff_sessions(session_token_hash);
create index if not exists staff_sessions_staff_idx on staff_sessions(staff_user_id, revoked_at, expires_at);
create index if not exists app_errors_created_idx on app_errors(created_at desc);
create index if not exists customer_orders_fulfillment_date_slot_idx on customer_orders(requested_fulfillment_date, delivery_slot, status);

alter table staff_sessions enable row level security;
alter table app_errors enable row level security;
alter table qa_checks enable row level security;

create policy "service role owns staff sessions" on staff_sessions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns app errors" on app_errors for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns qa checks" on qa_checks for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

insert into qa_checks (check_key, label)
values
  ('create_order', 'Create order'),
  ('update_payment', 'Update payment'),
  ('assign_runner', 'Assign runner'),
  ('complete_delivery', 'Complete delivery'),
  ('inventory_reduced', 'Inventory reduced'),
  ('points_awarded', 'Points awarded'),
  ('feedback_submitted', 'Feedback submitted'),
  ('reports_updated', 'Reports updated'),
  ('subscription_submitted', 'Subscription submitted'),
  ('corporate_lead_submitted', 'Corporate lead submitted')
on conflict (check_key) do nothing;

update customer_orders
set phone_number = '+267' || regexp_replace(phone_number, '\D', '', 'g')
where length(regexp_replace(phone_number, '\D', '', 'g')) = 8;

update customer_orders
set phone_number = '+' || regexp_replace(phone_number, '\D', '', 'g')
where regexp_replace(phone_number, '\D', '', 'g') like '267%'
  and length(regexp_replace(phone_number, '\D', '', 'g')) = 11
  and phone_number not like '+%';

update staff_users
set phone = '+267' || regexp_replace(phone, '\D', '', 'g')
where length(regexp_replace(phone, '\D', '', 'g')) = 8;

update customer_subscriptions
set phone = '+267' || regexp_replace(phone, '\D', '', 'g')
where length(regexp_replace(phone, '\D', '', 'g')) = 8;

update corporate_clients
set phone = '+267' || regexp_replace(phone, '\D', '', 'g')
where length(regexp_replace(phone, '\D', '', 'g')) = 8;
