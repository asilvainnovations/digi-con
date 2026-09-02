# DigiCon

**More than a digital business card — it turns introductions into relationships.**

DigiCon is a digital identity and relationship workspace for professionals, startups and
SMEs. The card is the entry point, not the product: the value is in what happens after the
handshake — capture, context, follow-up, and a network you can actually measure.

The product journey is
**Identity → Share → Connect → Capture → Organize → Follow up → Measure → Grow.**

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, Tailwind v4, shadcn/ui, TanStack Query |
| Backend | FastAPI (async), Pydantic v2 |
| Database | MongoDB via motor |
| Auth | Email + password, PBKDF2, httpOnly JWT session cookie |
| Payments | Stripe (optional — endpoints return 503 when unconfigured) |

> **Note on repository history.** This is the canonical DigiCon codebase. An earlier
> Supabase/Postgres prototype has been discarded; any Supabase, RLS or Auth0 material in
> older notes does not apply here.

---

## Quick start

```bash
# 1. Configuration — nothing has a working default
cp backend/.env.example backend/.env
python -c 'import secrets; print("JWT_SECRET=" + secrets.token_urlsafe(48))'
python -c 'import secrets; print("IP_HASH_SALT=" + secrets.token_urlsafe(32))'
# paste both into backend/.env

# 2. Backend  (http://localhost:8001)
cd backend && pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend (http://localhost:3000)
cd frontend && yarn install && yarn dev
```

**Use `yarn`, not `npm`.** npm currently fails on this dependency tree with
`Cannot read properties of null (reading 'edgesOut')`.

Optional demo data:

```bash
cd backend
DEMO_MODE=true DEMO_PASSWORD='<a password you choose>' python seed.py
```

The seed refuses to run unless `DEMO_MODE=true` and `APP_ENV=development`. It creates a
super-admin and resets its password on every run, so it must never point at production.

### Emergent platform only

The Visual Edits authoring plugin is not on a public registry, so it is deliberately not
in `package.json` — otherwise nobody outside the platform can install the project.
`vite.config.ts` loads it optionally, so inside the pod just add it:

```bash
yarn add --dev https://assets.emergent.sh/npm/emergentbase-visual-edits-1.0.14.tgz
```

---

## Configuration

All environment handling is resolved once in `backend/lib/config.py`, with
**production-safe defaults**: any `APP_ENV` other than `development` is treated as
production. Startup fails rather than degrading quietly if `JWT_SECRET` or `IP_HASH_SALT`
are unset, or if `CORS_ORIGINS` is `*` (which, with credentialed CORS, lets any site make
authenticated calls using a visitor's session cookie).

`PUBLIC_BASE_URL` is the origin used for QR payloads, vCard `SOURCE` and the Stripe
webhook — never the inbound request, which behind a proxy resolves to the internal host
and would bake `localhost` into a printed QR code.

See `backend/.env.example` for the full annotated list.

---

## Architecture

```
backend/
  server.py            app + router registration; index bootstrap on startup
  lib/config.py        all env handling, one place
  lib/indexes.py       unique + query indexes (uniqueness is correctness, not perf)
  lib/auth.py          hashing, session cookie, plan gating
  lib/card_modes.py    mode catalogue — the contextual axis (see below)
  lib/insights_rules.py  pure metric rules, no FastAPI or Mongo
  lib/net.py           proxy-aware client IP + salted hashing
  routers/             auth, cards (+public), relationships, followups, insights,
                       content (+admin), payments

frontend/src/
  App.tsx              route table; everything behind auth is React.lazy
  lib/cardModes.ts     mirror of the backend catalogue, fetched from /card-modes
  pages/ components/   screens and the shared UI kit
```

### The `/api` convention

Every backend route hangs off one `APIRouter(prefix="/api")`. The frontend always calls a
**relative** path (`apiGet("/cards")` → `/api/cards`), proxied to `:8001` in dev by Vite
and served behind a single origin in production. Never hang a route directly off `app`.

Nothing infers across the Python boundary: TypeScript interfaces in `src/types/index.ts`
mirror the Pydantic models by hand. **Change both in the same edit.**

---

## Card templates vs. card modes

These are independent axes and the distinction matters.

- A **template** is how a card *looks*.
- A **mode** is what the exchange is *for* — and it is load-bearing, not cosmetic.

The mode a card is in decides the primary call to action, which fields the capture form
asks for, and **how the resulting connection is filed**. The same identity handed to a
candidate at a job fair and a buyer at a trade show are not the same relationship:

| Mode | Visitor sees | Connection filed as |
|---|---|---|
| Networking | "Let's connect" | Contact · New |
| Sales | "Book a meeting" | Prospect · Qualified |
| Recruiting | "Apply or connect" | Candidate · New |
| Event | "Exchange contact" | Inbound · New |
| Personal | "Save my details" | Contact · New |

`backend/lib/card_modes.py` is the single source of truth; the catalogue is served from
`GET /api/card-modes` so client wording and server filing rules cannot drift apart. The
mode is derived from the goal chosen during onboarding and stays editable afterwards.

---

## The north-star metric

**Meaningful Connections Created** — deliberately *not* the row count of `relationships`,
which counts anyone who filled in a form. A connection is meaningful when it is
**reachable** (email or phone) **and** the owner has **engaged** with it (two or more
interactions, or qualified out of `New`).

Exposed on `/api/dashboard` as `meaningful_connections`, `meaningful_connections_30d` and
`connection_rate` (the share of card views that became one). Card views are recorded as
events, so "did this view lead anywhere" is answerable at all.

---

## Privacy and consent

A public card exposes identity fields only. Notes, interest, opportunity value, health,
follow-ups and interaction history are never returned by any `/public/*` route.

Anonymous contact capture (`POST /api/public/cards/{slug}/connect`) requires explicit
`consent: true` — a missing field is **not** read as consent — plus at least one contact
method, and is rate limited per card per source. Consent is stored alongside the data it
authorises (`consent`, `consent_at`, `consent_text_version`) and shown to the card owner,
who is the one who has to honour it. Visitor IPs are salted and hashed, never retained:
the throttle must not itself become a privacy problem. This is required by the Philippine
Data Privacy Act.

---

## Testing

```bash
cd backend && pytest        # pytest-xdist, already parallel — do not pass your own -n
cd frontend && yarn typecheck && yarn lint && yarn build
```

`backend/tests/test_audit_regressions.py` pins every defect from the September 2026 audit,
with the reasoning in each docstring. Copy `backend/tests/.env.test.example` to
`.env.test` and match it to what `seed.py` created.

Playwright specs belong in `tests/e2e/` (scaffolded, currently empty).

See `docs/AUDIT-2026-09.md` for the full audit and the open decisions.
