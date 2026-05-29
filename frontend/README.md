# Court Reporting Workflow — Frontend

Dashboard for managing transcription jobs, assigning court reporters and editors, tracking workflow status, and viewing payouts.

Built with **Next.js 16** (App Router), **React 19**, **TypeScript**, and **Tailwind CSS v4**.

## Prerequisites

- Node.js **>= 20.9.0** (Next.js 16 requirement)
- npm
- Backend API running (see `../backend/README.md`)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure the backend URL in `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   ```

## Run

Development:

```bash
npm run dev
```

App will be available at [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## Project Structure

```
app/
├── layout.tsx              # Root layout + sidebar shell
├── page.tsx                # Overview dashboard
├── jobs/page.tsx           # Job list, create, assignment, status transitions
├── reporters/page.tsx      # Reporter CRUD + availability toggle
├── editors/page.tsx        # Editor CRUD + availability toggle
├── payments/page.tsx       # Per-job earnings + totals
├── components/             # Reusable UI (Sidebar, Card, StatusBadge, ...)
└── lib/
    ├── api.ts              # Typed HTTP client for the backend
    ├── types.ts            # Shared types + status flow helpers
    └── format.ts           # IDR currency formatting
```

## Features

- **Sidebar navigation** between Overview, Jobs, Reporters, Editors, Payments
- **Job workflow** with strict status transitions: `NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED`
- **Smart reporter assignment** — same-city preference for physical jobs, with auto-suggest
- **Workload visibility** — assignment dropdowns surface active job counts so operators can avoid overbooking
- **Availability management** — toggle reporters/editors as available or unavailable in real time
- **Live payout calculation** — reporter earnings per minute, editor flat fee (counted once `REVIEWED`)
