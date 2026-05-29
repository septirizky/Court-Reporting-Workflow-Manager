# Court Reporting Workflow — Backend

REST API for the Court Reporting Workflow Manager. Handles jobs, reporter/editor assignment, status transitions, and payment calculation.

Built with **Node.js**, **TypeScript**, **Express 5**, **Sequelize**, and **PostgreSQL**.

**Live:** https://court-reporting-workflow-manager.onrender.com (Render free tier — may take 30–60 seconds to wake from idle)

**Postman collection:** [../docs/postman/court-reporting-api.postman_collection.json](../docs/postman/court-reporting-api.postman_collection.json)

Quick sanity check:

```bash
curl https://court-reporting-workflow-manager.onrender.com/health
# {"ok":true}
```

## Prerequisites

- Node.js **>= 18**
- PostgreSQL **>= 13**
- npm

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a PostgreSQL database:

   ```bash
   createdb voicescript_db
   ```

3. Configure credentials in `.env` (root of `backend/`):

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=voicescript_db
   PORT=4000
   ```

4. Seed initial data (creates schema + inserts sample reporters, editors, jobs):

   ```bash
   npm run seed
   ```

   > **Warning:** `seed` runs `sync({ force: true })` which **drops existing tables**. Use it only on a development database.

## Run

Development (with auto-reload):

```bash
npm run dev
```

API will be available at [http://localhost:4000](http://localhost:4000).

Production build:

```bash
npm run build
npm start
```

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `GET` | `/api/jobs` | List all jobs (with reporter & editor) |
| `POST` | `/api/jobs` | Create a job (`caseName`, `durationMinutes`, `locationType`, `city?`) |
| `GET` | `/api/jobs/:id` | Get a single job |
| `GET` | `/api/jobs/:id/suggest-reporter` | Recommend a reporter (same-city preference) |
| `POST` | `/api/jobs/:id/assign-reporter` | Assign reporter (`reporterId`), moves status to `ASSIGNED` |
| `POST` | `/api/jobs/:id/assign-editor` | Assign editor (`editorId`), job must be `TRANSCRIBED` |
| `PATCH` | `/api/jobs/:id/status` | Advance job to next status (`status`) |
| `GET` | `/api/jobs/:id/payment` | Payment breakdown for a single job |
| `GET` | `/api/jobs/payments/summary` | All-job payment totals + per-job breakdown |
| `GET` | `/api/reporters` | List reporters (includes `activeJobCount`) |
| `POST` | `/api/reporters` | Create reporter (`name`, `location`, `ratePerMinute?`, `available?`) |
| `PATCH` | `/api/reporters/:id` | Update reporter (any subset of fields) |
| `GET` | `/api/editors` | List editors (includes `activeJobCount`) |
| `POST` | `/api/editors` | Create editor (`name`, `flatFee?`, `available?`) |
| `PATCH` | `/api/editors/:id` | Update editor (any subset of fields) |

## Domain Model

```
NEW → ASSIGNED → TRANSCRIBED → REVIEWED → COMPLETED
```

Status transitions are forward-only and one step at a time. The backend rejects:

- skipping a step (e.g. `NEW → TRANSCRIBED` directly)
- moving to `TRANSCRIBED` without an assigned reporter
- moving to `REVIEWED` without an assigned editor

### Payment Rules

- **Reporter:** `durationMinutes × ratePerMinute` — counted once assigned
- **Editor:** flat fee per job — counted only once status is `REVIEWED` or later

## Project Structure

```
src/
├── index.ts                 # App entry — Express + Sequelize bootstrap
├── seed.ts                  # Seed script (sample reporters, editors, jobs)
├── config/database.ts       # Sequelize connection
├── models/                  # Sequelize models: Job, Reporter, Editor
├── services/                # Pure business logic
│   ├── assignment.ts        # Reporter suggestion (same-city preference)
│   └── payment.ts           # Payout calculation
├── controllers/             # HTTP handlers + request validation
├── routes/                  # Express routers (jobs, reporters, editors)
└── middleware/errorHandler.ts
```

Business logic lives in `services/` (pure functions, easy to unit-test) and is invoked from `controllers/`. This keeps HTTP concerns out of the domain layer.
