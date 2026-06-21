# Fresh Water Market OS Architecture

## Product Positioning

Fresh Water Market OS is a modular operating system for bottled water retail, water refill operations, branded bottle production, delivery logistics, and corporate/event sales across Botswana. The platform is designed for consumer ordering now and for multi-branch, franchise, and regional expansion later.

## System Domains

1. Customer Experience
   - Consumer and corporate accounts
   - Product catalog, subscriptions, wallet, loyalty, referrals
   - Delivery tracking, pickup scheduling, one-click reorder
2. Commerce and Orders
   - Real-time order intake, quotes, invoices, payment status
   - Bulk, event, refill, branded bottle, ice, and subscription orders
   - Workflow states from draft to delivered or cancelled
3. Fulfillment and Delivery
   - Dispatch board, route planning, delivery slots, pickup locations
   - Driver app, proof of delivery, vehicle assignment, failed delivery handling
4. Inventory and Production
   - Bottle, cap, label, water, ice, and raw material stock
   - Batch tracking, waste tracking, reorder alerts, supplier records
   - Personalized water production jobs with artwork approval
5. CRM and Growth
   - Customer segmentation, lead pipeline, follow-ups
   - WhatsApp, SMS, email, promo codes, referral campaigns
6. Corporate and Events
   - Account managers, negotiated pricing, monthly invoicing
   - Branded water requests, event supply planning, purchase orders
7. Finance and Analytics
   - Revenue, gross margin, receivables, refunds, branch performance
   - Customer lifetime value, churn, delivery efficiency, inventory turnover
8. Staff and Franchise Operations
   - Role-based dashboards, branch scoping, franchise reporting
   - Staff tasks, shift handover, vehicle and route ownership
9. AI and Automation
   - Demand forecasting, reorder recommendations, support assistant
   - Delivery optimization, campaign targeting, business intelligence assistant

## Application Surfaces

- Customer App: mobile-first customer ordering, tracking, wallet, loyalty, subscriptions.
- Staff Operations Console: orders, production, dispatch, inventory, CRM, support.
- Driver Dashboard: assigned routes, GPS status, proof of delivery, cash collection.
- Corporate Portal: bulk orders, monthly statements, branded requests, account manager messaging.
- Executive Dashboard: KPI monitoring, forecasts, branch/franchise performance.
- Franchise Console: branch-specific order, inventory, staff, finance, and compliance views.

## Technical Architecture

- Next.js serves the web application, API route handlers, and server actions.
- Supabase Auth handles identity with role claims and organization membership.
- Supabase PostgreSQL is the operational database.
- Supabase Storage stores label artwork, proof-of-delivery images, invoices, and documents.
- Supabase Edge Functions handle asynchronous tasks that need privileged access, webhooks, and scheduled jobs.
- Vercel hosts the frontend and serverless route handlers.
- Background jobs are event-driven through database changes, cron schedules, and webhook handlers.

## Domain Boundary Strategy

Each module owns its database tables, validation schemas, service functions, and UI views. Cross-module integration happens through explicit domain events such as `order.created`, `delivery.assigned`, `inventory.low_stock`, and `invoice.overdue`.

## Initial Build Scope

This repository starts with:

- Architecture documentation
- Database schema and RLS model
- API structure
- Core dashboard interface
- Domain configuration for catalog, pricing, KPIs, modules, roles, and operating workflows
- Supabase client boundary ready for live data

The next implementation wave should add authentication, persisted orders, inventory mutations, and workflow event logging.
