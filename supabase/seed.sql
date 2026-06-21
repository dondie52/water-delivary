insert into branches (name, code, type, address, city, country, status)
values ('Gaborone Central', 'GBE-CENTRAL', 'owned', 'Gaborone, Botswana', 'Gaborone', 'Botswana', 'active')
on conflict (code) do nothing;

insert into delivery_slots (label, starts_at, ends_at, capacity, active)
select slot.label, slot.starts_at::time, slot.ends_at::time, slot.capacity, true
from (
  values
    ('8am-10am', '08:00', '10:00', 42),
    ('1pm-3pm', '13:00', '15:00', 48),
    ('4pm-6pm', '16:00', '18:00', 54)
) as slot(label, starts_at, ends_at, capacity)
where not exists (
  select 1 from delivery_slots where delivery_slots.label = slot.label
);

insert into pickup_locations (branch_id, name, instructions, active)
select b.id, location.name, 'Customer pickup point', true
from branches b
cross join (
  values
    ('Vegas Parking Lot'),
    ('UB Clinic Parking'),
    ('475 Parking Lot'),
    ('Block 470 Parking Lot')
) as location(name)
where b.code = 'GBE-CENTRAL'
  and not exists (
    select 1 from pickup_locations
    where pickup_locations.branch_id = b.id
      and pickup_locations.name = location.name
  );

insert into products (sku, name, category, unit, volume_litres, case_size, active)
values
  ('FWM-BW-250', 'Fresh Water 250ml', 'bottled_water', 'bottle', 0.25, null, true),
  ('FWM-BW-330', 'Fresh Water 330ml', 'bottled_water', 'bottle', 0.33, null, true),
  ('FWM-BW-500', 'Fresh Water 500ml', 'bottled_water', 'bottle', 0.5, null, true),
  ('FWM-BW-1500', 'Fresh Water 1.5L', 'bottled_water', 'bottle', 1.5, null, true),
  ('FWM-BW-5000', 'Fresh Water 5L', 'bottled_water', 'bottle', 5, null, true),
  ('FWM-PW-250-24', 'Personalized 250ml x24', 'personalized_water', 'case', 6, 24, true),
  ('FWM-PW-330-24', 'Personalized 330ml x24', 'personalized_water', 'case', 7.92, 24, true),
  ('FWM-PW-500-24', 'Personalized 500ml x24', 'personalized_water', 'case', 12, 24, true),
  ('FWM-DESIGN-STICKER', 'Sticker Design', 'service', 'design', null, null, true),
  ('FWM-CASE-250-24', 'Standard 250ml x24', 'bottled_water', 'case', 6, 24, true),
  ('FWM-CASE-330-24', 'Standard 330ml x24', 'bottled_water', 'case', 7.92, 24, true),
  ('FWM-CASE-500-24', 'Standard 500ml x24', 'bottled_water', 'case', 12, 24, true),
  ('FWM-REFILL-L', 'Water Refill', 'refill', 'litre', 1, null, true),
  ('FWM-DEL-STUDENT', 'Student Delivery', 'service', 'trip', null, null, true)
on conflict (sku) do nothing;

insert into price_books (name, segment, currency, active_from)
select 'Retail BWP 2026', 'retail', 'BWP', current_date
where not exists (
  select 1 from price_books where name = 'Retail BWP 2026' and segment = 'retail'
);

insert into price_book_items (price_book_id, product_id, unit_price, minimum_quantity)
select pb.id, p.id, prices.unit_price, 1
from price_books pb
join (
  values
    ('FWM-BW-250', 3),
    ('FWM-BW-330', 4),
    ('FWM-BW-500', 5),
    ('FWM-BW-1500', 10),
    ('FWM-BW-5000', 20),
    ('FWM-PW-250-24', 96),
    ('FWM-PW-330-24', 120),
    ('FWM-PW-500-24', 144),
    ('FWM-DESIGN-STICKER', 200),
    ('FWM-CASE-250-24', 72),
    ('FWM-CASE-330-24', 96),
    ('FWM-CASE-500-24', 120),
    ('FWM-REFILL-L', 1.6),
    ('FWM-DEL-STUDENT', 30)
) as prices(sku, unit_price) on true
join products p on p.sku = prices.sku
where pb.name = 'Retail BWP 2026'
on conflict (price_book_id, product_id, minimum_quantity)
do update set unit_price = excluded.unit_price;

insert into inventory_items (sku, name, category, unit, reorder_point, target_stock, current_quantity)
values
  ('INV-FG-250ML', 'Finished 250ml Bottles', 'finished_goods', 'bottle', 240, 1200, 1200),
  ('INV-FG-330ML', 'Finished 330ml Bottles', 'finished_goods', 'bottle', 240, 1200, 1200),
  ('INV-FG-500ML', 'Finished 500ml Bottles', 'finished_goods', 'bottle', 240, 1200, 1200),
  ('INV-FG-1500ML', 'Finished 1.5L Bottles', 'finished_goods', 'bottle', 80, 400, 400),
  ('INV-FG-5000ML', 'Finished 5L Bottles', 'finished_goods', 'bottle', 40, 200, 200)
on conflict (sku)
do update set
  name = excluded.name,
  category = excluded.category,
  unit = excluded.unit,
  reorder_point = excluded.reorder_point,
  target_stock = excluded.target_stock;

insert into product_inventory_mappings (product_sku, inventory_item_id, quantity_per_unit)
select mapping.product_sku, inventory_items.id, mapping.quantity_per_unit
from (
  values
    ('FWM-BW-250', 'INV-FG-250ML', 1),
    ('FWM-BW-330', 'INV-FG-330ML', 1),
    ('FWM-BW-500', 'INV-FG-500ML', 1),
    ('FWM-BW-1500', 'INV-FG-1500ML', 1),
    ('FWM-BW-5000', 'INV-FG-5000ML', 1),
    ('FWM-CASE-250-24', 'INV-FG-250ML', 24),
    ('FWM-CASE-330-24', 'INV-FG-330ML', 24),
    ('FWM-CASE-500-24', 'INV-FG-500ML', 24),
    ('FWM-PW-250-24', 'INV-FG-250ML', 24),
    ('FWM-PW-330-24', 'INV-FG-330ML', 24),
    ('FWM-PW-500-24', 'INV-FG-500ML', 24)
) as mapping(product_sku, inventory_sku, quantity_per_unit)
join inventory_items on inventory_items.sku = mapping.inventory_sku
on conflict (product_sku, inventory_item_id)
do update set quantity_per_unit = excluded.quantity_per_unit;
