# Fresh Water Market OS

Enterprise operating system for Fresh Water Market: ordering, delivery, inventory, CRM, marketing, finance, staff, corporate accounts, franchises, and analytics.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- Supabase Auth, PostgreSQL, Storage, Edge Functions
- Vercel

## Run

```bash
npm install
npm run dev
```

Copy `.env.local.example` to `.env.local` and provide Supabase keys before enabling live auth and data writes.

Deploy the Next.js app on [Vercel](https://vercel.com) (import the GitHub repo). Add the same env vars in Vercel → Project → Settings → Environment Variables. Supabase stays the backend (database, auth, storage).

## Architecture

Start with the files in `docs/`:

- `docs/architecture.md`
- `docs/database-schema.md`
- `docs/api-structure.md`
- `docs/security-model.md`
- `docs/deployment-scaling.md`
