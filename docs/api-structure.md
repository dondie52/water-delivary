# API Structure

The platform is API-first. Next.js route handlers expose customer-facing and staff-facing endpoints, while privileged workflows run in Supabase Edge Functions.

## Versioning

All public JSON endpoints live under `/api/v1`. Internal server actions may call shared services directly.

## Endpoint Groups

### Auth and Profiles
- `GET /api/v1/me`
- `PATCH /api/v1/me`
- `GET /api/v1/accounts`
- `POST /api/v1/accounts`

### Catalog
- `GET /api/v1/catalog/products`
- `GET /api/v1/catalog/price-books`
- `POST /api/v1/catalog/quote`

### Orders
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/:id`
- `PATCH /api/v1/orders/:id/status`
- `POST /api/v1/orders/:id/reorder`
- `POST /api/v1/orders/:id/cancel`

### Delivery
- `GET /api/v1/delivery/slots`
- `GET /api/v1/delivery/dispatch-board`
- `POST /api/v1/delivery/assign`
- `PATCH /api/v1/delivery/:id/status`
- `POST /api/v1/delivery/:id/proof`

### Inventory
- `GET /api/v1/inventory/balances`
- `POST /api/v1/inventory/movements`
- `GET /api/v1/inventory/reorder-alerts`
- `POST /api/v1/inventory/transfers`

### Production
- `GET /api/v1/production/jobs`
- `PATCH /api/v1/production/jobs/:id`
- `POST /api/v1/production/jobs/:id/artwork`
- `POST /api/v1/production/jobs/:id/approve`

### CRM and Marketing
- `GET /api/v1/crm/customers`
- `GET /api/v1/crm/leads`
- `POST /api/v1/crm/leads`
- `POST /api/v1/marketing/campaigns`
- `POST /api/v1/marketing/promo-codes`

### Corporate
- `GET /api/v1/corporate/accounts`
- `GET /api/v1/corporate/invoices`
- `POST /api/v1/corporate/bulk-orders`
- `POST /api/v1/corporate/branded-water-requests`

### Analytics and AI
- `GET /api/v1/analytics/executive`
- `GET /api/v1/analytics/branch/:id`
- `POST /api/v1/ai/forecast-demand`
- `POST /api/v1/ai/recommend-inventory`
- `POST /api/v1/ai/assistant`

## Request Standards

- Validate every request body with Zod.
- Use cursor pagination for lists.
- Include `request_id` in responses and logs.
- Return typed errors with `code`, `message`, and optional `details`.
- Apply account, branch, and role checks in service functions and database RLS.

## Event Model

Important state transitions write to an append-only `domain_events` table:

- `order.created`
- `order.confirmed`
- `order.cancelled`
- `production.job_approved`
- `delivery.assigned`
- `delivery.completed`
- `inventory.low_stock`
- `invoice.issued`
- `payment.received`
- `customer.churn_risk_detected`

These events feed notifications, analytics, automation, and AI forecasting.
