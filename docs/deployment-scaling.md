# Deployment and Scaling Strategy

## Environments

- `local`: developer machine with Supabase project or local Supabase.
- `preview`: Vercel preview deployments per branch.
- `staging`: production-like Supabase and Vercel environment for acceptance testing.
- `production`: live Fresh Water Market operations.

## Deployment

1. Vercel deploys Next.js from the main branch.
2. Supabase migrations run through CI before production deploy.
3. Environment variables are managed in Vercel and Supabase secrets.
4. Edge Functions are versioned and deployed with migrations.
5. Rollbacks use Vercel deployment history plus reversible database migrations.

## Scaling

### Application
- Keep customer app and staff console in one codebase initially.
- Split heavy analytics, AI, and route optimization into Edge Functions or dedicated workers.
- Cache catalog, price books, pickup locations, and delivery slots with revalidation.

### Database
- Index all foreign keys and workflow filters.
- Partition high-volume tables such as `domain_events`, `stock_movements`, and `metric_snapshots` by month when volume demands it.
- Use read replicas for executive analytics at scale.
- Materialize KPI views for dashboards.

### Delivery and Routing
- Start with capacity-aware route grouping by slot, location, and vehicle.
- Add external map optimization when delivery volume justifies paid routing APIs.
- Keep manual dispatcher override at every step.

### AI
- Begin with deterministic forecasts from order history and seasonality.
- Add ML-backed demand forecasting once there is sufficient data.
- Keep AI recommendations explainable and reviewable by operations managers.

## Reliability

- Domain events make side effects retryable.
- Payment webhooks are idempotent by provider reference.
- Order status transitions are guarded by a finite-state workflow.
- Delivery proof uploads are stored before delivery completion is finalized.

## Botswana and Regional Expansion

- Currency defaults to BWP but price books support future currencies.
- Branches and franchises are first-class records.
- Pickup locations are branch-scoped.
- Corporate monthly invoicing and account managers are built into the core model.
- Regional rollout can add countries, tax rules, and localized payment providers without redesigning order flow.
