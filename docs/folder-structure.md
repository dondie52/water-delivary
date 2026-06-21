# Folder Structure

```text
src/
  app/
    api/v1/
    dashboard/
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
    operations/
    ui/
  config/
    operating-system.ts
  lib/
    supabase/
    utils.ts
  modules/
    analytics/
    catalog/
    delivery/
    finance/
    inventory/
    orders/
    roles/
docs/
  architecture.md
  database-schema.md
  api-structure.md
  security-model.md
  deployment-scaling.md
  folder-structure.md
supabase/
  migrations/
  seed.sql
```

The codebase is organized by stable domain boundaries, not by temporary screen names. UI components are shared, but business rules stay in modules.
