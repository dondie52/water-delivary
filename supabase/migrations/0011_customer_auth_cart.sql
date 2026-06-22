create table if not exists customer_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_profiles_phone_idx on customer_profiles (phone_number);

create table if not exists customer_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  sku text not null,
  service_type text not null check (service_type in ('refill', 'bottled', 'personalized', 'ice')),
  quantity int not null default 1 check (quantity >= 0),
  refill_litres numeric(12, 2) not null default 0 check (refill_litres >= 0),
  container_count int not null default 1 check (container_count >= 0),
  product_name text,
  unit_price numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, sku)
);

create index if not exists customer_cart_items_user_idx on customer_cart_items (user_id, updated_at desc);

drop trigger if exists customer_profiles_set_updated_at on customer_profiles;
create trigger customer_profiles_set_updated_at
before update on customer_profiles
for each row execute function set_updated_at();

drop trigger if exists customer_cart_items_set_updated_at on customer_cart_items;
create trigger customer_cart_items_set_updated_at
before update on customer_cart_items
for each row execute function set_updated_at();

alter table customer_profiles enable row level security;
alter table customer_cart_items enable row level security;

create policy "service role owns customer profiles"
on customer_profiles
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "users read own profile"
on customer_profiles
for select
using (auth.uid() = id);

create policy "users insert own profile"
on customer_profiles
for insert
with check (auth.uid() = id);

create policy "users update own profile"
on customer_profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "service role owns customer cart"
on customer_cart_items
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "users read own cart"
on customer_cart_items
for select
using (auth.uid() = user_id);

create policy "users insert own cart"
on customer_cart_items
for insert
with check (auth.uid() = user_id);

create policy "users update own cart"
on customer_cart_items
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users delete own cart"
on customer_cart_items
for delete
using (auth.uid() = user_id);
