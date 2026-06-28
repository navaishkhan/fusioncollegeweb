# Fusion College LMS — Deployment Guide

## Vercel

1. Push repository to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables from `.env.example`
4. Build command: `npm run build`
5. Deploy

## Supabase

1. Create project at [supabase.com](https://supabase.com)
2. Enable Email auth provider
3. Run `npm run db:push` and `npm run db:seed` locally (or use Supabase migration)
4. Execute `docs/supabase-rls.sql` in SQL Editor
5. Create Storage buckets: `materials`, `assignments`, `submissions`, `reports`
6. Add Vercel URL to Auth redirect URLs

## Post-deploy checklist

- [ ] Admin login works (`SEED_ADMIN_EMAIL` / password from seed)
- [ ] Marketing homepage at `/` matches legacy Vite site
- [ ] Role redirects: `/admin`, `/teacher`, `/student`, `/parent`
- [ ] Attendance lock + admin unlock tested
- [ ] Excel reports download from `/admin/reports`

## Vite cutover

After UAT sign-off:

1. Verify marketing parity on Next.js `/`
2. Point domain to Vercel
3. Remove or archive legacy `src/` Vite app
4. Use `npm run legacy:dev` only if reference needed during transition

## Local development

```bash
npm run dev          # Next.js on http://localhost:3000
npm run legacy:dev   # Legacy Vite on http://localhost:5173
```
