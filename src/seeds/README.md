# Database Seed Scripts

Idempotent seed scripts for local development and **Render production** deployments.

## Quick Start

```bash
# From backend/
npm run seed
```

Safe to re-run — uses `findOrCreate` / `upsertChild` throughout, so duplicate records are not created on redeploy.

## Render Deployment

### 1. Set environment variables on Render

| Variable | Example | Notes |
|----------|---------|-------|
| `DB_HOST` | `dpg-xxx.oregon-postgres.render.com` | From Render Postgres dashboard |
| `DB_NAME` | `abyssiniab2b` | |
| `DB_USERNAME` | `postgresql` | |
| `DB_PASSWORD` | *(secret)* | |
| `DB_SSL` | `true` | Required for Render Postgres |
| `DB_TYPE` | `postgres` | |
| `SEED_DEFAULT_PASSWORD` | `YourSecurePassword!` | Password for demo accounts |
| `PRODUCTION` | `true` | |

### 2. Run seeds after first deploy

**Option A — Render Shell (recommended for first seed):**

```bash
cd backend && npm run seed
```

**Option B — One-off deploy command** (add to Render service temporarily):

```
npm run seed && npm start
```

### 3. Verify

After seeding, these demo accounts are available:

| Email | Role | Password |
|-------|------|----------|
| `superadmin@abyssinab2b.com` | Super Admin | `SEED_DEFAULT_PASSWORD` or `password123` |
| `admin@abyssinab2b.com` | Admin | same |
| `buyer1@abyssinab2b.com` | Buyer | same |
| `buyer2@abyssinab2b.com` | Buyer | same |
| `supplier1@abyssinab2b.com` | Supplier | same |
| `supplier2@abyssinab2b.com` | Supplier | same |

> Change `SEED_DEFAULT_PASSWORD` on Render before running seeds in production.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run seed` | Full seed: system → users → marketplace |
| `npm run seed:marketplace` | Marketplace only (also seeds system + users as dependencies) |
| `npm run seed:categories` | Add extra categories (already included in full seed) |

## Structure

```
src/seeds/
├── index.ts              # Main runner
├── seed.helpers.ts       # DB init, column migration, upsertChild helper
├── system.seed.ts        # Config, File entries
├── user.seed.ts          # Roles, users, profiles, action logs
├── marketplace.seed.ts   # Categories, products, quotes, blog, etc.
└── categories.extra.seed.ts  # Standalone extra categories (optional)
```

## Seed Data Overview

### System
- Site config (name, emails, phone, pagination)
- Default file entries (avatar, product placeholder, logo)

### Users
- 4 roles: Super Admin, Admin, Buyer, Supplier
- 6 demo users with profiles and welcome notifications

### Marketplace
- **10 categories** (Agriculture, Food & Beverage, Apparel, etc.)
- **6 subcategories** (Coffee, Sesame, Pulses, Spices, Fruits, Processed Foods)
- **2 verified suppliers** linked to supplier users
- **6 products** with images, specs, incoterms, target markets, use cases
- **3 quote/sourcing requests** including new fields:
  - Trade Term / Incoterm (FOB, CIF, etc.)
  - Payment Term (T/T, L/C, D/P)
  - Target Country, Destination Port
  - Shipping Method, Lead Time
  - Product name (for contact-form sourcing without a product ID)
- **3 blog posts**, newsletter subscriptions, carts, addresses

## Schema Compatibility

`seed.helpers.ts` automatically adds missing `quote_requests` columns on Render databases that were created before the sourcing-request feature. This runs before seeding and is safe to execute multiple times.

## Notes

- Seeds run in dependency order (system → users → marketplace)
- All child records use `findOrCreate` — safe for re-deploys
- Passwords are bcrypt-hashed using `SEED_DEFAULT_PASSWORD` env var
- Does **not** use `alter: true` on sync — production-safe
