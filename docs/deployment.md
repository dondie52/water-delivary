# Deployment

## Vercel

1. Push the repository to GitHub.
2. Create a Vercel project from the repository.
3. Add environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
DRIVER_PASSWORD
```

4. Deploy.

## Supabase

1. Push every migration in `supabase/migrations` (see `docs/setup.md` — `npm run db:login`, `npm run db:link`, `npm run db:push`).
2. Run `supabase/seed.sql`.
3. Confirm `/admin/deployment`.
4. Create at least one admin staff user in `/admin/staff`.
5. Use `/admin/qa` to complete a launch rehearsal.

## Production Checks

- Confirm service role key is only set server-side.
- Confirm admin and driver pages require login.
- Confirm `/order` works without staff login.
- Confirm order completion updates inventory and points.
- Confirm `/admin/errors` is empty after a smoke test.
