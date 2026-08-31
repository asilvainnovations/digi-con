# DigiCon — living spec

Mobile-first digital identity + lightweight relationship workspace.
Journey: IDENTITY → SHARE → CONNECT → CAPTURE → ORGANIZE → FOLLOW UP → MEASURE → GROW.

## Stack (deviation from the request)
Requested Supabase/Postgres + Node/Express; this environment is **FastAPI + MongoDB (motor) + Vite/React 19/TS**.
Built on the pod stack. All API routes hang off `api_router` under `/api`.

## Auth & roles
- Email + password, PBKDF2 hashing, httpOnly JWT session cookie (`digicon_session`), 30 days.
- Roles: `user`, `super_admin`. Plans: `free`, `pro`.
- Endpoints: `/api/auth/{signup,login,logout,me,onboarding,profile}`.
- Onboarding creates the user's first card automatically (3 steps + "Your DigiCon is ready").

## Plan gating (server-enforced in `backend/lib/auth.py`)
Paid features: `analytics`, `export`, `wallet`, `landing_pwa`, `crm_pipeline`, `multi_card`.
Free = 1 card (`POST /api/cards` returns **402** beyond that); `/api/analytics` and
`/api/cards/{id}/export` return 402 for free users. `/api/entitlements` reports the matrix.

## Collections
`users`, `cards`, `relationships`, `interactions`, `followups`, `blog_posts`, `payment_transactions`.
All ids are string uuid4. Datetimes stored aware UTC, normalised on read.

## Key endpoints
- Cards: `GET/POST /cards`, `PUT/DELETE /cards/{id}`, `GET /cards/{id}/export` (paid)
- Public (no auth): `GET /public/cards/{slug}`, `/qr.png`, `/vcard`, `POST /public/cards/{slug}/connect`
  (contact exchange → creates a relationship + interaction for the card owner)
- Relationships: CRUD `/relationships`, `?q=&status=&tag=`; `/relationships/{id}/interactions` GET/POST
- Follow-ups: `GET/POST /followups`, `PATCH /followups/{id}` (status), `DELETE`
- Insights: `GET /dashboard` (all plans), `GET /analytics` (paid)
- Content: `GET /posts`, `GET /posts/{slug}`; admin `/admin/{stats,users,users/{id}/plan,posts}`
- Payments: `GET /payments/plans`, `POST /payments/checkout`, `GET /payments/status/{sid}`,
  webhook `POST /api/webhook/stripe` (emergentintegrations, Flow B, `STRIPE_API_KEY=sk_test_emergent`).
  Stripe claimable sandbox was **unavailable** (country PH not supported) — shared test key used instead.

## Privacy boundary
Public card exposes identity fields only. Notes, interest, opportunity value, health,
follow-ups and interaction history are never returned by any `/public/*` route.

## Frontend routes
Public: `/`, `/login`, `/signup`, `/pricing`, `/blog`, `/blog/:slug`, `/c/:slug`,
`/about /faq /use-cases /resources /support /terms /privacy /cookies /accessibility` (InfoPage).
Protected: `/onboarding`, `/dashboard`, `/cards`, `/cards/new`, `/cards/:cardId`, `/share`,
`/contacts`, `/contacts/:relId`, `/followups`, `/crm`, `/analytics`, `/wallet`, `/landing-pwa`,
`/settings`, `/billing`, `/checkout`, `/payment/success`, `/payment/cancel`. Admin: `/admin`.

## Navigation
Mobile: persistent bottom nav (Home, Cards, Network, Follow Up, Profile) + drawer for secondary.
Desktop: sidebar with the same primary set plus Grow group (CRM, Analytics, Share, Wallet, Subscription).

## Design system
Glass + metal, deep navy foundation, electric blue/cyan for action, gold reserved for premium.
Fonts: Montserrat (headings), Poppins (UI), Roboto Condensed (dense text) via @fontsource.
PWA: `public/manifest.webmanifest` + `public/sw.js` (API always network, shell cached).

## Seed data (`cd /app/backend && python seed.py`, idempotent)
Pro account owns 6 relationships (David Lim, Miguel Reyes, Aisha Rahman, Jessica Chen,
Sofia Villanueva, Kenji Watanabe), 5 open follow-ups (one overdue), 2 completed, interaction
history, and a published card at `/c/maria-santos`. 3 blog posts (2 published, 1 draft).
