# Company Secretariat Frontend

A Next.js 16 application for corporate governance surveys and board evaluation. Migrated from Vercel to Replit.

## Architecture

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Session-token based (httpOnly cookie + Bearer token), stored in local DB
- **API**: Next.js Route Handlers — local API routes for auth/admin, optional upstream proxy via `API_PROXY_TARGET`

## Key Features

- Board evaluation and peer-to-peer director evaluation surveys
- Admin dashboard with results, submissions, graphical analysis
- Role-based access (ADMIN / USER)
- Hybrid auth: local DB sessions + optional upstream API fallback

## Running the App

The app runs on **port 5000** (required for Replit webview).

```bash
npm run dev    # Development: next dev -p 5000 -H 0.0.0.0
npm run start  # Production: next start -p 5000 -H 0.0.0.0
```

## Environment Variables / Secrets

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `SESSION_SECRET` | Secret for session signing (optional) |
| `API_PROXY_TARGET` | Upstream backend base URL for proxying (optional) |
| `NEXT_PUBLIC_API_BASE_URL` | Public API base URL (defaults to same-origin) |

## Project Structure

```
src/
  app/
    (auth)/          # Login, signup, forgot/reset password pages + server actions
    (protected)/     # Admin dashboard, surveys (requires auth)
    api/             # Route handlers: auth, admin CRUD, proxy catch-all
    globals.css
    layout.tsx
    page.tsx
  components/
    auth/            # Login, signup, logout, forgot/reset password forms
    layout/          # AppShell, Header, Sidebar
    providers/       # AuthProvider context
    surveys/         # SurveyForm, SubmissionDetail, OverallPercentageField
  lib/
    api.ts           # Client-side fetch helper
    api-session.ts   # Server-side session resolution (DB + upstream)
    auth.ts          # Session user type + getSessionUser helper
    db.ts            # Prisma client singleton
    surveys.ts       # Survey definitions (board-evaluation, peer-evaluation)
prisma/
  schema.prisma      # User, Session, Submission models
```

## Workflow

- **Start application**: `npm run dev` — runs Next.js on port 5000 with webview output
