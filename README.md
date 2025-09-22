//==============================================================
// FILE: README.md
// DESCRIPTION: One-stop setup & deployment guide for the Bookstore.
//==============================================================


# Bookstore — Production-Ready (Next.js 14 App Router)


A full‑stack bookstore with: account sign up/sign in (NextAuth), browsing & search, cart, checkout (Stripe), orders, reviews, wishlist, admin basics, and Google Books import. DB via Prisma (PostgreSQL). Styling with Tailwind + shadcn/ui.


> **You only need to:** create your `.env` from `.env.example` and deploy (Vercel recommended). No code edits required.


## Tech Stack
- Next.js 14 (App Router, Server Actions, Edge-safe where possible)
- TypeScript
- Prisma + PostgreSQL
- NextAuth (Credentials + OAuth ready)
- Stripe Checkout (no webhooks needed for MVP; order capture done on success page via session lookup)
- TailwindCSS + shadcn/ui
- Google Books API (import & enrich)


## Quick Start


```bash
# 1) Install deps
pnpm i # or yarn / npm


# 2) Copy envs
cp .env.example .env
# Fill values (see below)


# 3) DB: migrate & seed
pnpm prisma:migrate
pnpm prisma:seed


# 4) Dev
pnpm dev


# 5) Prod build
pnpm build && pnpm start
```


## Environment Variables (.env)
See `.env.example` for all variables you must set. Minimum needed:
- `DATABASE_URL` (Postgres)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `GOOGLE_BOOKS_API_KEY` (optional but recommended)
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_PRICE_DEFAULT` (a Stripe Price ID used for generic checkout when item-specific price not set)


## Deployment
- **Vercel**: set all env vars in project settings → *Deploy*.
- **Stripe**: Add your domain (e.g., vercel.app) to allowed redirect URLs if using Connect later. For this MVP, we use Checkout Sessions and confirm on `/checkout/success`.


## Admin
- Admin pages are protected by role. Use the seeded admin `admin@example.com` / `Admin@1234` (change in `prisma/seed.ts`).


## Notes on Payments
- We avoid webhooks to keep deploy simple. On success page we verify `session_id` via Stripe API and create the order.
- You can later enable webhooks and remove the success-page verification.


## SQL
- Prisma schema drives migrations, but a raw `schema.sql` is provided for transparency.


---