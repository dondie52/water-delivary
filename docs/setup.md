# Local Setup

1. Install dependencies:

```bash
npm.cmd install
```

2. Create `.env.local` from `.env.example` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD=
DRIVER_PASSWORD=
```

3. Push Supabase migrations to your remote project (through `0011_customer_auth_cart.sql`).

   **Option A — CLI (recommended for day-to-day work)**

   ```bash
   npm run db:login
   npm run db:link
   npm run db:push
   ```

   - Use `npm run db:push:dry` first to preview pending migrations.
   - After schema changes, create a new file with `npm run db:new -- <name>` then `npm run db:push`.
   - Prefer `npx supabase` / the npm scripts above. The globally installed `supabase` command can fail on Windows (`spawnSync UNKNOWN`); the project dev dependency avoids that.

   **Option B — Cursor Supabase MCP**

   Ask the agent to apply new files under `supabase/migrations/` to project `szigieqqosdeywlvasrs` when the CLI is not linked or login is unavailable.

4. Run seed data:

```sql
-- Run contents of supabase/seed.sql in Supabase SQL editor.
```

5. Start locally:

```bash
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

6. Open `/staff/login`, or use emergency `/admin/login` only if staff accounts are not created yet.

## Phase 7/8 customer and admin pages

| Page | Purpose |
|------|---------|
| `/track` | Customer order lookup by phone or order number |
| `/admin/products` | Manage catalog products, prices, and sort order |
| `/admin/promos` | Create and manage promo codes |
| `/admin/marketing` | Marketing overview and catalog links |

The homepage reads live catalog prices and pilot delivery/refill settings when Supabase is configured, with static fallback pricing if the API is unavailable.
