# AirMatch Backend

Lightweight **Node.js + Express** API for [AirMatch](https://github.com/jaydeepdodiya/airmatch).

## Related repository

- **Flutter app:** [github.com/jaydeepdodiya/airmatch-flutter](https://github.com/jaydeepdodiya/airmatch-flutter)

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
| `npm start` | Start in production mode |

## What we add next

1. **Users** — profile linked to Firebase Auth
2. **Trips** — airport, arrival time, destination
3. **Matches** — find travelers with similar routes
4. **Database** — MongoDB or PostgreSQL (we'll pick one together)
