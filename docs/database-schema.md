# Database Schema

The database is PostgreSQL on Supabase. Every business table includes `id uuid primary key`, `created_at timestamptz`, `updated_at timestamptz`, and branch or organization scoping where relevant.

## Identity and Access

### profiles
- `id uuid references auth.users`
- `full_name text`
- `phone text`
- `email text`
- `default_account_id uuid`
- `status text check in ('active','suspended','deleted')`

### accounts
- `id uuid`
- `type text check in ('consumer','student','corporate','event_organizer','franchise','internal')`
- `name text`
- `tax_identifier text`
- `billing_email text`
- `credit_limit numeric`
- `payment_terms_days int`
- `account_manager_id uuid references profiles`

### account_members
- `account_id uuid references accounts`
- `profile_id uuid references profiles`
- `role text check in ('owner','buyer','finance','viewer')`

### staff_members
- `profile_id uuid references profiles`
- `branch_id uuid references branches`
- `role text check in ('admin','operations_manager','dispatcher','driver','inventory_manager','production_manager','sales','finance','support','franchise_owner')`
- `active boolean`

## Organization

### branches
- `id uuid`
- `name text`
- `code text unique`
- `type text check in ('owned','franchise','pickup_point','warehouse','production')`
- `address text`
- `city text default 'Gaborone'`
- `country text default 'Botswana'`
- `latitude numeric`
- `longitude numeric`
- `status text`

### pickup_locations
- `id uuid`
- `branch_id uuid references branches`
- `name text`
- `instructions text`
- `latitude numeric`
- `longitude numeric`
- `active boolean`

## Catalog and Pricing

### products
- `id uuid`
- `sku text unique`
- `name text`
- `category text check in ('bottled_water','personalized_water','refill','ice','service','deposit')`
- `unit text`
- `volume_litres numeric`
- `case_size int`
- `active boolean`

### price_books
- `id uuid`
- `name text`
- `segment text check in ('retail','student','corporate','event','franchise')`
- `currency text default 'BWP'`
- `active_from date`
- `active_to date`

### price_book_items
- `price_book_id uuid references price_books`
- `product_id uuid references products`
- `unit_price numeric`
- `minimum_quantity int`

## Orders

### orders
- `id uuid`
- `order_number text unique`
- `account_id uuid references accounts`
- `customer_id uuid references profiles`
- `branch_id uuid references branches`
- `channel text check in ('customer_app','staff_console','corporate_portal','whatsapp','phone','walk_in')`
- `fulfillment_type text check in ('delivery','pickup')`
- `status text check in ('draft','submitted','confirmed','in_production','ready_for_dispatch','out_for_delivery','ready_for_pickup','delivered','completed','cancelled','refunded')`
- `subtotal numeric`
- `delivery_fee numeric`
- `discount_total numeric`
- `tax_total numeric`
- `grand_total numeric`
- `payment_status text`
- `requested_slot_id uuid references delivery_slots`
- `pickup_location_id uuid references pickup_locations`
- `notes text`

### order_items
- `id uuid`
- `order_id uuid references orders`
- `product_id uuid references products`
- `description text`
- `quantity numeric`
- `unit_price numeric`
- `line_total numeric`
- `production_required boolean`

### branded_water_jobs
- `id uuid`
- `order_id uuid references orders`
- `status text check in ('brief_received','design_pending','awaiting_approval','approved','printing','labelling','packed','completed')`
- `sticker_design_required boolean`
- `artwork_url text`
- `approval_notes text`
- `due_at timestamptz`

## Delivery

### delivery_slots
- `id uuid`
- `label text`
- `starts_at time`
- `ends_at time`
- `capacity int`
- `active boolean`

### vehicles
- `id uuid`
- `branch_id uuid references branches`
- `registration text`
- `capacity_litres numeric`
- `status text`

### deliveries
- `id uuid`
- `order_id uuid references orders`
- `driver_id uuid references staff_members(profile_id)`
- `vehicle_id uuid references vehicles`
- `status text check in ('queued','assigned','en_route','arrived','delivered','failed','returned')`
- `route_sequence int`
- `address text`
- `latitude numeric`
- `longitude numeric`
- `proof_url text`
- `delivered_at timestamptz`

## Inventory

### inventory_items
- `id uuid`
- `sku text unique`
- `name text`
- `category text check in ('water','bottle','cap','label','ice','packaging','finished_goods')`
- `unit text`
- `reorder_point numeric`
- `target_stock numeric`

### stock_locations
- `id uuid`
- `branch_id uuid references branches`
- `name text`
- `type text check in ('retail','warehouse','vehicle','production')`

### stock_balances
- `item_id uuid references inventory_items`
- `location_id uuid references stock_locations`
- `quantity numeric`

### stock_movements
- `id uuid`
- `item_id uuid references inventory_items`
- `location_id uuid references stock_locations`
- `movement_type text check in ('purchase','production','sale','transfer','adjustment','waste')`
- `quantity numeric`
- `reference_type text`
- `reference_id uuid`
- `created_by uuid references profiles`

## CRM and Marketing

### leads
- `id uuid`
- `account_id uuid references accounts`
- `source text`
- `stage text check in ('new','qualified','quoted','won','lost')`
- `estimated_value numeric`
- `next_follow_up_at timestamptz`

### campaigns
- `id uuid`
- `name text`
- `channel text check in ('whatsapp','sms','email','social','referral')`
- `segment text`
- `status text`
- `budget numeric`

### promo_codes
- `id uuid`
- `code text unique`
- `discount_type text check in ('fixed','percentage','free_delivery')`
- `discount_value numeric`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `max_redemptions int`

## Finance

### invoices
- `id uuid`
- `account_id uuid references accounts`
- `order_id uuid references orders`
- `invoice_number text unique`
- `status text check in ('draft','issued','part_paid','paid','overdue','void')`
- `due_at date`
- `total numeric`

### payments
- `id uuid`
- `account_id uuid references accounts`
- `order_id uuid references orders`
- `invoice_id uuid references invoices`
- `method text`
- `status text`
- `amount numeric`
- `provider_reference text`

## Analytics and AI

### metric_snapshots
- `id uuid`
- `branch_id uuid references branches`
- `metric_key text`
- `metric_value numeric`
- `period_start date`
- `period_end date`

### forecasts
- `id uuid`
- `branch_id uuid references branches`
- `forecast_type text check in ('demand','inventory','delivery_capacity','revenue')`
- `target_date date`
- `payload jsonb`
- `confidence numeric`

## Required Seed Data

- Products and prices listed in the business objective
- Delivery slots: 08:00-10:00, 13:00-15:00, 16:00-18:00
- Pickup locations: Vegas Parking Lot, UB Clinic Parking, 475 Parking Lot, Block 470 Parking Lot
- Default owned branch: Gaborone Central
