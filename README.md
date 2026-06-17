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

Open [http://localhost:3000/api/health](http://localhost:3000/api/health) — you should see:

```json
{ "status": "ok", "service": "airmatch-api", "timestamp": "..." }
```

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
