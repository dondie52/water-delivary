create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  value numeric(12, 2) not null check (value >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit is null or usage_limit >= 0),
  used_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table customer_orders
  add column if not exists promo_code text,
  add column if not exists discount_amount numeric(12, 2) not null default 0,
  add column if not exists referred_by_phone text;

alter table customer_points
  add column if not exists referral_count int not null default 0;

alter table products
  add column if not exists sort_order int not null default 0;

create index if not exists promo_codes_code_idx on promo_codes(upper(code));
create index if not exists customer_orders_promo_code_idx on customer_orders(promo_code, created_at desc);
create index if not exists customer_orders_referred_by_phone_idx on customer_orders(referred_by_phone, created_at desc);

drop trigger if exists promo_codes_set_updated_at on promo_codes;
create trigger promo_codes_set_updated_at before update on promo_codes for each row execute function set_updated_at();

alter table promo_codes enable row level security;

create policy "service role owns promo codes"
on promo_codes
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

update customer_orders
set referred_by_phone = '+267' || regexp_replace(referred_by_phone, '\D', '', 'g')
where referred_by_phone is not null
  and length(regexp_replace(referred_by_phone, '\D', '', 'g')) = 8;

update customer_orders
set referred_by_phone = '+' || regexp_replace(referred_by_phone, '\D', '', 'g')
where referred_by_phone is not null
  and regexp_replace(referred_by_phone, '\D', '', 'g') like '267%'
  and length(regexp_replace(referred_by_phone, '\D', '', 'g')) = 11
  and referred_by_phone not like '+%';
