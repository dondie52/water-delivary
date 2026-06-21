alter table customer_orders
  add column if not exists assigned_runner_name text,
  add column if not exists assigned_runner_phone text;

alter table inventory_items
  add column if not exists current_quantity numeric(12, 2) not null default 0;

create table if not exists product_inventory_mappings (
  id uuid primary key default gen_random_uuid(),
  product_sku text not null references products(sku) on delete cascade,
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  quantity_per_unit numeric(12, 2) not null default 1,
  created_at timestamptz not null default now(),
  unique (product_sku, inventory_item_id)
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references inventory_items(id) on delete cascade,
  order_id uuid references customer_orders(id) on delete set null,
  movement_type text not null check (movement_type in ('order_completed', 'adjustment', 'restock')),
  quantity_delta numeric(12, 2) not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists customer_points (
  phone_number text primary key,
  customer_name text,
  points int not null default 0,
  lifetime_spend numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists customer_orders_runner_status_idx on customer_orders(assigned_runner_phone, status);
create index if not exists inventory_items_low_stock_idx on inventory_items(category, current_quantity, reorder_point);
create index if not exists inventory_movements_order_idx on inventory_movements(order_id);

alter table product_inventory_mappings enable row level security;
alter table inventory_movements enable row level security;
alter table customer_points enable row level security;

create policy "service role owns product inventory mappings"
on product_inventory_mappings
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role owns inventory movements"
on inventory_movements
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

create policy "service role owns customer points"
on customer_points
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
