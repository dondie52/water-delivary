create extension if not exists "pgcrypto";

create type account_type as enum ('consumer', 'student', 'corporate', 'event_organizer', 'franchise', 'internal');
create type branch_type as enum ('owned', 'franchise', 'pickup_point', 'warehouse', 'production');
create type product_category as enum ('bottled_water', 'personalized_water', 'refill', 'ice', 'service', 'deposit');
create type order_status as enum ('draft', 'submitted', 'confirmed', 'in_production', 'ready_for_dispatch', 'out_for_delivery', 'ready_for_pickup', 'delivered', 'completed', 'cancelled', 'refunded');
create type fulfillment_type as enum ('delivery', 'pickup');
create type delivery_status as enum ('queued', 'assigned', 'en_route', 'arrived', 'delivered', 'failed', 'returned');
create type staff_role as enum ('admin', 'operations_manager', 'dispatcher', 'driver', 'inventory_manager', 'production_manager', 'sales', 'finance', 'support', 'franchise_owner');

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  default_account_id uuid,
  status text not null default 'active' check (status in ('active', 'suspended', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  type account_type not null,
  name text not null,
  tax_identifier text,
  billing_email text,
  credit_limit numeric(12, 2) not null default 0,
  payment_terms_days int not null default 0,
  account_manager_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles
  add constraint profiles_default_account_id_fkey foreign key (default_account_id) references accounts(id);

create table account_members (
  account_id uuid not null references accounts(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'buyer', 'finance', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (account_id, profile_id)
);

create table branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  type branch_type not null,
  address text,
  city text not null default 'Gaborone',
  country text not null default 'Botswana',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_members (
  profile_id uuid primary key references profiles(id) on delete cascade,
  branch_id uuid references branches(id),
  role staff_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table pickup_locations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id) on delete cascade,
  name text not null,
  instructions text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category product_category not null,
  unit text not null,
  volume_litres numeric(10, 2),
  case_size int,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table price_books (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null check (segment in ('retail', 'student', 'corporate', 'event', 'franchise')),
  currency text not null default 'BWP',
  active_from date not null,
  active_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table price_book_items (
  price_book_id uuid not null references price_books(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  minimum_quantity int not null default 1,
  created_at timestamptz not null default now(),
  primary key (price_book_id, product_id, minimum_quantity)
);

create table delivery_slots (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  starts_at time not null,
  ends_at time not null,
  capacity int not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  account_id uuid references accounts(id),
  customer_id uuid references profiles(id),
  branch_id uuid references branches(id),
  channel text not null check (channel in ('customer_app', 'staff_console', 'corporate_portal', 'whatsapp', 'phone', 'walk_in')),
  fulfillment_type fulfillment_type not null,
  status order_status not null default 'draft',
  subtotal numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  discount_total numeric(12, 2) not null default 0,
  tax_total numeric(12, 2) not null default 0,
  grand_total numeric(12, 2) not null default 0,
  payment_status text not null default 'unpaid',
  requested_slot_id uuid references delivery_slots(id),
  pickup_location_id uuid references pickup_locations(id),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  description text not null,
  quantity numeric(12, 2) not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  production_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table branded_water_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null default 'brief_received' check (status in ('brief_received', 'design_pending', 'awaiting_approval', 'approved', 'printing', 'labelling', 'packed', 'completed')),
  sticker_design_required boolean not null default false,
  artwork_url text,
  approval_notes text,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vehicles (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  registration text not null,
  capacity_litres numeric(12, 2),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  driver_id uuid references staff_members(profile_id),
  vehicle_id uuid references vehicles(id),
  status delivery_status not null default 'queued',
  route_sequence int,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  proof_url text,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table inventory_items (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category text not null check (category in ('water', 'bottle', 'cap', 'label', 'ice', 'packaging', 'finished_goods')),
  unit text not null,
  reorder_point numeric(12, 2) not null default 0,
  target_stock numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stock_locations (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  name text not null,
  type text not null check (type in ('retail', 'warehouse', 'vehicle', 'production')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stock_balances (
  item_id uuid not null references inventory_items(id) on delete cascade,
  location_id uuid not null references stock_locations(id) on delete cascade,
  quantity numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (item_id, location_id)
);

create table stock_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id),
  location_id uuid not null references stock_locations(id),
  movement_type text not null check (movement_type in ('purchase', 'production', 'sale', 'transfer', 'adjustment', 'waste')),
  quantity numeric(12, 2) not null,
  reference_type text,
  reference_id uuid,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  source text,
  stage text not null default 'new' check (stage in ('new', 'qualified', 'quoted', 'won', 'lost')),
  estimated_value numeric(12, 2),
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('whatsapp', 'sms', 'email', 'social', 'referral')),
  segment text,
  status text not null default 'draft',
  budget numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  order_id uuid references orders(id),
  invoice_number text not null unique,
  status text not null default 'draft' check (status in ('draft', 'issued', 'part_paid', 'paid', 'overdue', 'void')),
  due_at date,
  total numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id),
  order_id uuid references orders(id),
  invoice_id uuid references invoices(id),
  method text not null,
  status text not null,
  amount numeric(12, 2) not null,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table domain_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  account_id uuid references accounts(id),
  branch_id uuid references branches(id),
  actor_id uuid references profiles(id),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  metric_key text not null,
  metric_value numeric(14, 4) not null,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create table forecasts (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid references branches(id),
  forecast_type text not null check (forecast_type in ('demand', 'inventory', 'delivery_capacity', 'revenue')),
  target_date date not null,
  payload jsonb not null default '{}'::jsonb,
  confidence numeric(5, 4),
  created_at timestamptz not null default now()
);

create index orders_account_id_idx on orders(account_id);
create index orders_branch_status_idx on orders(branch_id, status);
create index deliveries_driver_status_idx on deliveries(driver_id, status);
create index stock_movements_item_created_idx on stock_movements(item_id, created_at desc);
create index domain_events_type_created_idx on domain_events(event_type, created_at desc);
create index invoices_account_status_idx on invoices(account_id, status);

create trigger profiles_set_updated_at before update on profiles for each row execute function set_updated_at();
create trigger accounts_set_updated_at before update on accounts for each row execute function set_updated_at();
create trigger branches_set_updated_at before update on branches for each row execute function set_updated_at();
create trigger orders_set_updated_at before update on orders for each row execute function set_updated_at();
create trigger order_items_set_updated_at before update on order_items for each row execute function set_updated_at();
create trigger deliveries_set_updated_at before update on deliveries for each row execute function set_updated_at();

alter table profiles enable row level security;
alter table accounts enable row level security;
alter table account_members enable row level security;
alter table staff_members enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table deliveries enable row level security;
alter table invoices enable row level security;
alter table payments enable row level security;

create policy "profiles read own" on profiles
for select using (id = auth.uid());

create policy "profiles update own" on profiles
for update using (id = auth.uid()) with check (id = auth.uid());

create policy "account members read account" on accounts
for select using (
  exists (
    select 1 from account_members
    where account_members.account_id = accounts.id
      and account_members.profile_id = auth.uid()
  )
);

create policy "account members read memberships" on account_members
for select using (profile_id = auth.uid());

create policy "customers read own orders" on orders
for select using (
  customer_id = auth.uid()
  or exists (
    select 1 from account_members
    where account_members.account_id = orders.account_id
      and account_members.profile_id = auth.uid()
  )
);

create policy "customers create own orders" on orders
for insert with check (
  customer_id = auth.uid()
  or exists (
    select 1 from account_members
    where account_members.account_id = orders.account_id
      and account_members.profile_id = auth.uid()
      and account_members.role in ('owner', 'buyer')
  )
);

create policy "drivers read assigned deliveries" on deliveries
for select using (driver_id = auth.uid());

create policy "finance reads account invoices" on invoices
for select using (
  exists (
    select 1 from account_members
    where account_members.account_id = invoices.account_id
      and account_members.profile_id = auth.uid()
      and account_members.role in ('owner', 'finance')
  )
);
