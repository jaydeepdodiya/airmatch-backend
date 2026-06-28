# AirMatch Backend

Lightweight **Node.js + Express** API for [AirMatch](https://github.com/jaydeepdodiya/airmatch).

## Related repository

- **Flutter app:** [github.com/jaydeepdodiya/airmatch-flutter](https://github.com/jaydeepdodiya/airmatch-flutter)

## Learn backend (for Flutter developers)

**New to Node.js?** Start here:

📖 **[docs/BACKEND_LEARNING.md](docs/BACKEND_LEARNING.md)** — explains every file using Flutter analogies (BLoC = Controller, UseCase = Service, etc.)

📋 **[../docs/ROADMAP.md](../docs/ROADMAP.md)** — step-by-step build plan for Flutter + backend together

## Folder structure

```
backend/
├── src/
│   ├── server.js          # Starts the HTTP server
│   ├── app.js             # Express app (middleware + routes)
│   ├── config/
│   │   └── env.js         # Environment variables
│   ├── routes/            # URL definitions → controllers
│   ├── controllers/       # Request/response logic
│   └── middleware/        # Shared request handlers (errors, auth later)
├── package.json
└── .env.example
```

## How a request flows

```
Flutter app  →  GET /api/health  →  routes/health.routes.js
                                 →  controllers/health.controller.js
                                 →  JSON response
```

## Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Git workflow

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready API |
| `development` | Active feature work — **branch from here** |

```bash
git checkout development
git pull origin development
# make changes...
git add .
git commit -m "feat: your change"
git push origin development
# Open PR: development → main when ready
```

**Repo:** [github.com/jaydeepdodiya/airmatch-backend](https://github.com/jaydeepdodiya/airmatch-backend)

## Phase 0 features

- `GET /api/health` — health check
- `GET /api/trips` — list active trips
- `POST /api/trips` — create trip intent
- `GET /api/trips/:id` — get one trip
- `GET /api/trips/:id/matches` — matching engine (score ≥ 0.65)

**PRD:** [docs/PRD.md](docs/PRD.md)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with auto-reload on file changes |
| `npm run check` | Syntax-check entrypoint without starting server |

## Production deploy (Render)

1. Create a **MongoDB Atlas** cluster → copy connection string
2. Firebase Console → Service accounts → **Generate new private key**
3. [Render](https://render.com) → New **Web Service** → connect `airmatch-backend` repo
4. Use `render.yaml` or set env vars from `.env.production.example`:
   - `NODE_ENV=production`
   - `SKIP_AUTH=false`
   - `MONGODB_URI=...`
   - `FIREBASE_SERVICE_ACCOUNT_JSON=...` (paste full JSON)
5. Deploy → verify `GET https://YOUR-SERVICE.onrender.com/api/health`

```bash
curl https://YOUR-SERVICE.onrender.com/api/health
# → {"status":"ok","service":"airmatch-api","environment":"production",...}
```

## Release PR (development → main)

```bash
git checkout development && git pull
# smoke test locally, then:
gh pr create --base main --head development --title "Release: v1.0.0"
```

CI runs on every push/PR (`.github/workflows/ci.yml`).

## What we add next

Portfolio project is feature-complete through Step 10. Optional polish:

1. Apple Sign-In (App Store requirement for some apps)
2. Integration tests with real Firebase test users
3. App Store / Play Store screenshots and listing copy
