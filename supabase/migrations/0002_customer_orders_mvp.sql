create table if not exists customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  product_sku text not null references products(sku),
  product_name text not null,
  product_unit_price numeric(12, 2) not null default 0,
  quantity int not null default 0 check (quantity >= 0),
  refill_litres numeric(12, 2) not null default 0 check (refill_litres >= 0),
  fulfillment_type text not null check (fulfillment_type in ('pickup', 'delivery')),
  pickup_location text,
  delivery_slot text,
  customer_name text not null,
  phone_number text not null,
  payment_method text not null check (payment_method in ('cash', 'orange_money', 'card', 'bank_transfer')),
  subtotal numeric(12, 2) not null default 0,
  refill_total numeric(12, 2) not null default 0,
  delivery_fee numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'partial')),
  whatsapp_message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_status_created_idx on customer_orders(status, created_at desc);
create index if not exists customer_orders_payment_status_idx on customer_orders(payment_status);

drop trigger if exists customer_orders_set_updated_at on customer_orders;
create trigger customer_orders_set_updated_at
before update on customer_orders
for each row execute function set_updated_at();

alter table customer_orders enable row level security;

create policy "service role owns customer order intake"
on customer_orders
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
