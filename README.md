# Page Pulse

Page Pulse audits any public website in seconds: HTTP status, response time, page title, meta
description, heading structure, image accessibility, word count, and derived SEO/performance
scores — all in a clean SaaS-style dashboard.

**Monorepo layout:** `backend/` (Node/Express/TypeScript API) + `frontend/` (React/Vite/TypeScript
dashboard).

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Folder Structure](#folder-structure)
3. [Environment Variables](#environment-variables)
4. [API Documentation](#api-documentation)
5. [Design Decisions](#design-decisions)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Future Improvements](#future-improvements)

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev        # starts the API on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # leave VITE_API_BASE_URL empty for local dev (uses Vite's proxy)
npm run dev             # starts the dashboard on http://localhost:5173
```

Open **http://localhost:5173**, enter any URL, and click **Analyze**.

### 3. Run the backend test suite

```bash
cd backend
npm test                # Jest + Supertest, network calls mocked with nock
npm run test:coverage
```

---

## Folder Structure

```
page-pulse/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Request handlers (thin — orchestration only)
│   │   │   └── analyze.controller.ts
│   │   ├── routes/            # Express routers
│   │   │   └── analyze.routes.ts
│   │   ├── services/          # Business logic (pure, testable)
│   │   │   ├── scraper.service.ts     # Fetches the URL, maps network errors
│   │   │   └── analyzer.service.ts    # Parses HTML → metrics + scores
│   │   ├── middleware/
│   │   │   ├── validators.ts          # express-validator request rules
│   │   │   └── errorHandler.ts        # Central error → JSON mapping
│   │   ├── utils/
│   │   │   └── urlValidator.ts        # URL normalization + validation
│   │   ├── types/
│   │   │   └── index.ts               # Shared interfaces + AppError class
│   │   ├── tests/
│   │   │   ├── analyze.test.ts            # Integration tests (Supertest + nock)
│   │   │   └── analyzer.service.test.ts   # Pure unit tests
│   │   ├── app.ts             # Express app factory (middleware + routes)
│   │   └── server.ts          # Bootstraps HTTP server, graceful shutdown
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI building blocks
│   │   │   ├── Hero.tsx
│   │   │   ├── UrlForm.tsx
│   │   │   ├── PulseLine.tsx          # Signature ECG/waveform motif
│   │   │   ├── LoadingAnimation.tsx
│   │   │   ├── ErrorAlert.tsx
│   │   │   ├── ScoreBadge.tsx         # SEO/Performance ring
│   │   │   ├── ResultCard.tsx
│   │   │   ├── ResultsGrid.tsx
│   │   │   ├── RecentSearches.tsx
│   │   │   └── DarkModeToggle.tsx
│   │   ├── pages/
│   │   │   └── Dashboard.tsx  # Top-level page composing everything
│   │   ├── hooks/
│   │   │   ├── useAnalyze.ts  # Request lifecycle state machine
│   │   │   ├── useHistory.ts  # Recent-searches persistence (localStorage)
│   │   │   └── useDarkMode.ts
│   │   ├── services/
│   │   │   └── api.ts         # Axios client + error normalization
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── scoring.ts     # Score → color/tier mapping
│   │   │   └── export.ts      # Copy-JSON + PDF export
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── .env.example
│
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable            | Description                                            | Default                 |
|---------------------|----------------------------------------------------------|--------------------------|
| `PORT`               | Port the API listens on                                 | `5000`                  |
| `NODE_ENV`           | `development` \| `production` \| `test`                 | `development`            |
| `CORS_ORIGIN`        | Comma-separated list of allowed origins (or `*`)         | `http://localhost:5173` |
| `FETCH_TIMEOUT_MS`   | Timeout for fetching the target page                     | `8000`                  |
| `MAX_REDIRECTS`      | Max redirects to follow before failing                   | `5`                      |
| `USER_AGENT`         | User-Agent header sent when fetching pages                | `PagePulseBot/1.0`      |

### Frontend (`frontend/.env`)

| Variable                | Description                                                                 |
|--------------------------|-------------------------------------------------------------------------------|
| `VITE_API_BASE_URL`      | Base URL of the deployed API. Leave empty in dev — Vite proxies `/api` to `localhost:5000`. |

---

## API Documentation

### `POST /api/analyze`

Analyzes a URL and returns audit metrics.

**Request body**

```json
{ "url": "https://example.com" }
```

**Success response — `200 OK`**

```json
{
  "url": "https://example.com/",
  "status": 200,
  "responseTime": "430ms",
  "title": "Example Domain",
  "metaDescription": "This domain is for use in illustrative examples.",
  "h1Count": 1,
  "missingAltImages": 1,
  "totalImages": 2,
  "wordCount": 1850,
  "seoScore": 82,
  "performanceScore": 90,
  "redirected": false,
  "finalUrl": "https://example.com/",
  "contentType": "text/html; charset=UTF-8",
  "fetchedAt": "2026-07-25T10:15:00.000Z"
}
```

**Error response — uniform envelope**

```json
{
  "error": {
    "code": "TIMEOUT",
    "message": "The request to https://example.com timed out after 8000ms."
  }
}
```

| Code               | HTTP Status | Meaning                                        |
|---------------------|-------------|-------------------------------------------------|
| `VALIDATION_ERROR`   | 400         | Request body missing/malformed `url`             |
| `INVALID_URL`        | 400         | URL fails structural validation                 |
| `NOT_FOUND`          | 404         | Target page returned 404                        |
| `NON_HTML_CONTENT`   | 422         | URL doesn't return `text/html`                  |
| `DNS_FAILURE`        | 502         | Domain could not be resolved                    |
| `CONNECTION_REFUSED` | 502         | Target server refused/reset the connection       |
| `UPSTREAM_ERROR`     | 502         | Target returned 5xx or another network failure   |
| `TIMEOUT`            | 504         | Target did not respond within the timeout window |
| `INTERNAL_ERROR`     | 500         | Unexpected server-side failure                  |

### `GET /api/health`

Simple liveness check, returns `{ "status": "ok", ... }`. Useful for uptime monitors and Render's
health check configuration.

---

## Design Decisions

- **Service/controller separation.** Controllers only orchestrate; all business logic
  (`scraper.service.ts`, `analyzer.service.ts`) is dependency-free and pure where possible, which
  makes it trivial to unit test without spinning up Express.
- **`app.ts` vs `server.ts` split.** `createApp()` returns a configured Express instance without
  binding a port, so Supertest can exercise it directly in tests — no open sockets, no port
  conflicts, no need to mock `http.Server`.
- **Typed errors (`AppError`).** Every failure mode (invalid URL, DNS failure, timeout, 404,
  non-HTML, etc.) is raised as the same `AppError` class with a `code` and `statusCode`. One
  global error handler converts all of them into the same JSON envelope — the API can never leak
  an unhandled stack trace or crash the process on bad input.
- **`validateStatus: () => true` in the scraper.** Axios is told to never throw on non-2xx
  responses, so 404s and 500s are handled as *data* (inspected and converted to `AppError`)
  instead of exceptions, keeping control flow linear and explicit.
- **Deterministic, explainable scoring.** `seoScore` and `performanceScore` are computed with
  simple, documented rules (missing title → -25, etc.) rather than an opaque model — the score is
  defensible and testable, and a reviewer can see exactly why a page scored what it did.
- **Design language: a "vitals monitor" for websites.** The name Page Pulse is taken literally —
  the signature visual is a reusable ECG/heartbeat waveform (`PulseLine.tsx`) used in the hero
  backdrop and as the loading state, tying the brand to the product's actual job (reading a site's
  vitals). Typography pairs Space Grotesk (headings) with Inter (body) and JetBrains Mono for all
  numeric readouts, reinforcing the "diagnostic readout" feel. The ink/pulse-teal palette with a
  violet secondary accent avoids the generic cream+serif or plain near-black+single-accent looks
  in favor of something specific to a monitoring tool.
- **Client-side history via `localStorage`.** Recent searches are a pure UX convenience with no
  PII and no server storage requirement, so keeping them client-side avoids adding a database to
  the spec's scope.
- **Security defaults.** `helmet()` for HTTP security headers, `express.json({ limit: '10kb' })` to
  cap payload size, a basic SSRF guard blocking `localhost`/loopback targets, and a capped
  `maxContentLength` on outbound fetches to avoid downloading huge binaries.

---

## Testing

Backend tests (`backend/src/tests/`) use **Jest**, **Supertest**, and **nock** (to mock outbound
HTTP without hitting the real network):

- ✅ Happy path — full HTML page, all metrics extracted correctly
- ✅ Missing/invalid `url` in the request body → `400`
- ✅ Malformed URL string → `400 INVALID_URL`
- ✅ Upstream `404` → `404 NOT_FOUND`
- ✅ Upstream `500` → `502 UPSTREAM_ERROR`
- ✅ Request timeout → `504 TIMEOUT`
- ✅ DNS resolution failure → `502 DNS_FAILURE`
- ✅ Non-HTML content-type → `422 NON_HTML_CONTENT`
- ✅ Redirect following + final URL reporting
- ✅ `analyzer.service.ts` pure unit tests (title/meta/h1/alt/word-count extraction, scoring)

Run with `npm test` inside `backend/`.

---

## Deployment

### Backend → Render

1. Push this repo to GitHub.
2. In Render, create a **Web Service**, point it at the repo, set **Root Directory** to `backend`.
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add the environment variables from `backend/.env.example` in Render's dashboard.
6. Render provides a public URL, e.g. `https://page-pulse-api.onrender.com` — set your health
   check path to `/api/health`.

### Frontend → Vercel

1. In Vercel, import the same repo, set **Root Directory** to `frontend`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`, Output directory: `dist`.
4. Add environment variable `VITE_API_BASE_URL` = your Render backend URL (no trailing slash).
5. Deploy — Vercel gives you a production URL automatically.

### GitHub

```bash
git init
git add .
git commit -m "Initial commit: Page Pulse"
git branch -M main
git remote add origin https://github.com/<your-username>/page-pulse.git
git push -u origin main
```

---

## Future Improvements

- **Historical trend tracking** — store audits server-side (Postgres/Redis) to chart a site's
  scores over time instead of only the last 8 client-side entries.
- **Lighthouse-style deep performance metrics** — integrate a headless-browser check (Playwright)
  for LCP/CLS/TBT rather than a single response-time proxy.
- **Batch/bulk audits** — accept a list of URLs (e.g. an entire sitemap) and return a summary
  table.
- **Authentication + saved reports** — let users create an account, save audits, and share a
  public report link.
- **Rate limiting** — add `express-rate-limit` per IP to protect the API from abuse in production.
- **Caching** — short-TTL cache (Redis) on identical URLs to reduce redundant fetches and speed
  up repeated audits.
- **Accessibility scoring beyond ALT text** — contrast ratio checks, ARIA landmark checks,
  heading-order validation.
- **CI/CD** — GitHub Actions workflow to run `npm test` and `npm run lint` on every PR before
  deploy.
