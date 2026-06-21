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

Copy `.env.example` to `.env.local` and provide Supabase keys before enabling live auth and data writes.

## Architecture

Start with the files in `docs/`:

- `docs/architecture.md`
- `docs/database-schema.md`
- `docs/api-structure.md`
- `docs/security-model.md`
- `docs/deployment-scaling.md`
