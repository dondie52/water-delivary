# Security Model

## Principles

- Deny by default.
- Scope all data by account, branch, or franchise.
- Keep privileged keys only on the server.
- Use Supabase RLS as the final authorization layer.
- Record audit events for operational and financial actions.

## Roles

- `super_admin`: platform-wide access.
- `operations_manager`: branch operations, orders, delivery, inventory, production.
- `dispatcher`: delivery planning and driver assignment.
- `driver`: assigned deliveries only.
- `inventory_manager`: inventory balances, purchases, transfers, waste.
- `production_manager`: branded water jobs and production status.
- `sales`: leads, quotes, customers, campaigns.
- `finance`: invoices, payments, receivables.
- `support`: customer profiles, orders, follow-ups.
- `franchise_owner`: scoped franchise branch analytics and operations.
- `corporate_buyer`: corporate ordering and request management.
- `corporate_finance`: invoices, statements, payment status.
- `customer`: own orders, wallet, loyalty, profile.

## RLS Policies

- Customers can read and update their own profile.
- Account members can read accounts they belong to.
- Corporate buyers can create orders for their account.
- Staff can read orders scoped to their assigned branch.
- Drivers can read deliveries assigned to themselves.
- Finance can read and mutate invoices/payments for scoped branches/accounts.
- Franchise users can only read branch data attached to their franchise.
- Super admins can access all rows.

## Authentication

- Supabase Auth for email/phone OTP and magic links.
- Optional SSO for enterprise corporate clients later.
- JWT contains profile id and coarse app role.
- Fine-grained permissions are resolved from `staff_members` and `account_members`.

## Storage Security

- `artwork`: corporate/customer-readable by account membership, staff writable.
- `proof-of-delivery`: driver writable for assigned delivery, staff readable by branch.
- `invoices`: corporate finance and finance staff readable.
- `public-assets`: read-only public files.

## Audit Requirements

Audit these actions:

- Order status changes
- Price overrides and discounts
- Invoice issue, void, and payment reconciliation
- Stock adjustments and waste
- Delivery proof uploads
- User role changes
- Corporate credit limit changes

## Data Protection

- Avoid storing card data. Use payment provider tokens.
- Encrypt sensitive operational notes where required.
- Back up PostgreSQL daily with point-in-time recovery.
- Retain domain events for at least seven years for finance and compliance analysis.
