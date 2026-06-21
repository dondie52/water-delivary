create table if not exists staff_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  role text not null check (role in ('admin', 'manager', 'driver')),
  pin_hash text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null,
  entity_type text,
  entity_id text,
  staff_id uuid references staff_users(id) on delete set null,
  staff_name text,
  staff_role text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  customer_name text not null,
  product_preference text not null,
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly')),
  preferred_slot text,
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  notes text,
  status text not null default 'new' check (status in ('new', 'approved', 'paused', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists corporate_clients (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_person text not null,
  phone text not null,
  email text,
  use_case text not null,
  bottle_size text,
  quantity int not null default 0,
  branding_required boolean not null default false,
  notes text,
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists customer_notes (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null,
  note text not null,
  staff_name text,
  created_at timestamptz not null default now()
);

alter table customer_orders
  add column if not exists order_type text not null default 'standard' check (order_type in ('standard', 'personalized')),
  add column if not exists sticker_design_required boolean not null default false,
  add column if not exists branding_text text,
  add column if not exists event_name text,
  add column if not exists design_notes text,
  add column if not exists personalized_stage text check (personalized_stage in ('design_pending', 'design_approved', 'production', 'ready', 'completed'));

create index if not exists audit_logs_action_created_idx on audit_logs(action, created_at desc);
create index if not exists customer_subscriptions_phone_idx on customer_subscriptions(phone, created_at desc);
create index if not exists corporate_clients_status_idx on corporate_clients(status, created_at desc);
create index if not exists customer_notes_phone_idx on customer_notes(phone_number, created_at desc);

drop trigger if exists staff_users_set_updated_at on staff_users;
create trigger staff_users_set_updated_at before update on staff_users for each row execute function set_updated_at();

drop trigger if exists customer_subscriptions_set_updated_at on customer_subscriptions;
create trigger customer_subscriptions_set_updated_at before update on customer_subscriptions for each row execute function set_updated_at();

drop trigger if exists corporate_clients_set_updated_at on corporate_clients;
create trigger corporate_clients_set_updated_at before update on corporate_clients for each row execute function set_updated_at();

alter table staff_users enable row level security;
alter table audit_logs enable row level security;
alter table customer_subscriptions enable row level security;
alter table corporate_clients enable row level security;
alter table customer_notes enable row level security;

create policy "service role owns staff users" on staff_users for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns audit logs" on audit_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns subscriptions" on customer_subscriptions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns corporate clients" on corporate_clients for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role owns customer notes" on customer_notes for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
