# Pilot Runbook

## Daily Opening

1. Open `/admin/deployment` and confirm environment, Supabase, and seed checks.
2. Open `/admin/qa` and review the current pilot checklist.
3. Open `/admin/settings` and confirm pilot is active, delivery fee, refill price, slot capacity, and WhatsApp number.
4. Check `/admin/inventory` for low stock.
5. Check `/admin/orders` for pending orders.
6. Review `/admin/products` if prices or sort order changed.
7. Review `/admin/promos` for active codes and usage limits.

## Order Flow

1. Customer places an order at `/order`.
2. Customer can track status at `/track` using their order number or phone.
3. Staff confirms payment and status at `/admin/orders/[id]`.
4. Staff assigns a runner.
5. Runner opens `/driver` and marks the order completed.
6. Completion reduces mapped bottled-water inventory and awards loyalty points.
7. Customer submits feedback at `/feedback/[orderNumber]`.

## Marketing and Monetization

1. Use `/admin/products` to keep catalog prices and display order current.
2. Use `/admin/promos` to create limited-time or usage-capped discount codes.
3. Use `/admin/marketing` for a quick overview of catalog and growth pages.
4. Confirm homepage pricing matches catalog after product changes.

## Closing

1. Review `/admin/reports` for gross revenue, discounts, net revenue, promo usage, and referral orders.
2. Export orders, manifest, inventory, and reports CSVs if needed.
3. Review `/admin/errors` and resolve known issues.
4. Review `/admin/audit` for staff activity.
