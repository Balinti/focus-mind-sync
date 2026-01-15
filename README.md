# Focus Mind Sync

A "Deep Work OS" that lets anyone instantly run a focus block with ultra-light check-ins and metrics (no signup required), then optionally connect Supabase + Stripe to save progress and unlock Pro.

## Features

- **Focus Blocks**: 50, 60, or 90 minute deep work sessions
- **Check-ins**: Start (outcome + optional blocker) and end (done/partial/blocked + next step)
- **Interruption tracking**: Count and track interruptions during focus
- **Metrics dashboard**: Today/this week focus minutes, blocks completed, interruptions, streak
- **Anonymous mode**: Everything works with localStorage (no signup required)
- **Auth**: Supabase email/password for saving long-term progress
- **Pro subscription**: Stripe subscription for unlimited history + advanced insights

## File Structure

```
focus-mind-sync/
├── app/
│   ├── layout.tsx              # Root layout with Navbar
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── app/
│   │   └── page.tsx            # Focus timer (core experience)
│   ├── dashboard/
│   │   └── page.tsx            # Metrics dashboard
│   ├── pricing/
│   │   └── page.tsx            # Pricing page
│   ├── auth/
│   │   └── page.tsx            # Sign up / Sign in / Account
│   └── api/
│       ├── auth/
│       │   └── migrate/
│       │       └── route.ts    # Migrate localStorage to Supabase
│       ├── stripe/
│       │   ├── checkout/
│       │   │   └── route.ts    # Create Stripe checkout session
│       │   └── webhook/
│       │       └── route.ts    # Handle Stripe webhooks
│       └── subscription/
│           └── route.ts        # Get subscription status
├── components/
│   ├── FocusTimer.tsx          # Main timer component
│   ├── CheckInForm.tsx         # Start/end check-in forms
│   ├── SoftSignupPrompt.tsx    # Prompt after first block
│   ├── Navbar.tsx              # Navigation bar
│   └── PricingTable.tsx        # Free vs Pro comparison
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser Supabase client
│   │   └── server.ts           # Server Supabase client
│   ├── storage.ts              # localStorage helpers
│   ├── metrics.ts              # Metrics calculation
│   ├── stripe.ts               # Stripe client
│   └── env.ts                  # Environment helpers
├── scripts/
│   └── migrate.js              # Database migration script
├── supabase/
│   ├── schema.sql              # Database schema
│   └── rls.sql                 # Row Level Security policies
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Database Schema

### focus_sessions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users |
| started_at | TIMESTAMPTZ | Session start time |
| ended_at | TIMESTAMPTZ | Session end time |
| planned_minutes | INTEGER | Planned duration (50/60/90) |
| outcome | TEXT | Goal for the session |
| blocker_text | TEXT | Optional blocker noted at start |
| result | TEXT | done/partial/blocked |
| next_step | TEXT | Next action after session |
| interruptions_count | INTEGER | Number of interruptions |
| created_at | TIMESTAMPTZ | Record creation time |

### subscriptions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | References auth.users (unique) |
| stripe_customer_id | TEXT | Stripe customer ID |
| stripe_subscription_id | TEXT | Stripe subscription ID |
| status | TEXT | Subscription status |
| price_id | TEXT | Stripe price ID |
| current_period_end | TIMESTAMPTZ | Billing period end |
| cancel_at_period_end | BOOLEAN | Cancellation flag |
| updated_at | TIMESTAMPTZ | Last update time |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/migrate` | POST | Migrate localStorage sessions to Supabase |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |
| `/api/subscription` | GET | Get current user's subscription status |

## UI Pages

| Page | Path | Description |
|------|------|-------------|
| Landing | `/` | Hero, features, "Try it now" CTA |
| Focus | `/app` | Timer, check-ins, interruptions |
| Dashboard | `/dashboard` | Metrics and session history |
| Pricing | `/pricing` | Free vs Pro comparison |
| Auth | `/auth` | Sign up / Sign in / Account |

## Environment Variables

### Used from available list:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key (client)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server only)
- `STRIPE_SECRET_KEY` - Stripe secret key (server only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (optional)
- `DATABASE_URL` - Direct database connection for migrations

### New env vars needed:
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Stripe price ID for Pro monthly (required for Pro upgrade button)
- `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` - Stripe price ID for Pro yearly (optional)
- `NEXT_PUBLIC_APP_URL` - App URL for redirects (set to https://focus-mind-sync.vercel.app)

## Service Status

### ACTIVE (using available env vars):
- Supabase Auth (email/password)
- Supabase Database (focus_sessions, subscriptions)
- Stripe Checkout (subscription)
- Stripe Webhooks

### INACTIVE (needs setup):
- `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` - Pro upgrade button hidden until set
- `NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID` - Yearly pricing option

## Local Development

```bash
npm install
npm run dev
```

## Database Migration

To apply the database schema to your Supabase project:

```bash
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" npm run db:migrate
```

Or run the SQL files directly in the Supabase SQL Editor:
1. Run `supabase/schema.sql` to create tables
2. Run `supabase/rls.sql` to apply Row Level Security policies

## Deployment

Deployed to Vercel at https://focus-mind-sync.vercel.app
