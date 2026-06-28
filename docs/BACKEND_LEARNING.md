# AirMatch Backend — Learn Node.js Step by Step

You know **Flutter + BLoC + Clean Architecture**. Backend uses the **same ideas** with different names.

---

## 1. Flutter vs Backend — Same Ideas, Different Names

| Flutter (you know) | Backend (Node.js) | What it does |
|--------------------|-------------------|--------------|
| `main.dart` | `server.js` | Starts the app |
| `MaterialApp` | `app.js` | App shell + global setup |
| **Screen / Route** | **Route** (`routes/*.js`) | URL → which code runs |
| **BLoC** | **Controller** | Handles user action, returns result |
| **UseCase** | **Service** | Business logic (matching, scoring) |
| **Repository** | **Store** (for now) | Save / read data |
| **Model / Entity** | **Object in store** | Trip, User shape |
| **Dio interceptor** | **Middleware** | Runs before every request (auth) |
| **GetIt** | `require()` imports | Wire dependencies |
| **Hive / DB** | `tripStore.js` (memory) → MongoDB later | Persistence |

---

## 2. What Happens When Flutter Calls the API?

Example: Flutter creates a trip with Dio `POST /api/trips`.

```
┌─────────────┐     HTTP POST + JSON      ┌──────────────────────────────────┐
│ Flutter app │ ────────────────────────► │ Node.js server (port 3000)       │
│  TripBloc   │     Authorization: Bearer │                                  │
└─────────────┘                           │  1. app.js        → parse JSON   │
                                          │  2. requireAuth   → who is user? │
                                          │  3. trips.routes  → which handler│
                                          │  4. controller    → validate     │
                                          │  5. tripStore     → save trip    │
                                          │  6. JSON response ◄──────────────│
                                          └──────────────────────────────────┘
```

**Think of it like:** `TripBloc` receives `TripCreateSubmitted` → calls `CreateTrip` use case → repository saves → emits new state.

On backend: **route** receives POST → **controller** validates → **store** saves → **res.json()** sends response.

---

## 3. Every File Explained (Simple English)

```
backend/
├── package.json          ← pubspec.yaml (lists dependencies: express, cors, etc.)
├── .env                  ← secrets (PORT, SKIP_AUTH) — never commit
├── .env.example          ← template showing which vars exist
└── src/
    ├── server.js         ← main() — starts listening on port 3000
    ├── app.js            ← MaterialApp — middleware + mount /api routes
    │
    ├── config/
    │   ├── env.js        ← reads .env (like --dart-define)
    │   └── firebase.js   ← Firebase Admin init (verify tokens)
    │
    ├── routes/           ← URL map (like GoRouter paths)
    │   ├── index.js      ← /api/health, /api/users, /api/trips
    │   ├── health.routes.js
    │   ├── users.routes.js
    │   └── trips.routes.js
    │
    ├── controllers/      ← like BLoC handlers (thin: validate → call service → respond)
    │   ├── health.controller.js
    │   ├── users.controller.js
    │   └── trips.controller.js
    │
    ├── services/         ← like UseCases + domain logic
    │   ├── tripStore.js      ← save/list trips (temporary in-memory DB)
    │   ├── userStore.js      ← save/list users
    │   └── matchService.js   ← matching algorithm (scores trips)
    │
    ├── middleware/       ← like Dio interceptors
    │   ├── requireAuth.js    ← check Firebase token
    │   ├── notFound.js       ← 404 handler
    │   └── errorHandler.js   ← catch all errors
    │
    └── utils/
        └── id.js           ← generate UUID (like uuid package)
```

---

## 4. Read One Request End-to-End (Create Trip)

### Step A — Flutter sends this:

```http
POST http://localhost:3000/api/trips
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "airportIata": "SFO",
  "arrivalAt": "2026-06-20T14:30:00.000Z",
  "destinationLabel": "Downtown SF",
  "destinationLat": 37.7749,
  "destinationLng": -122.4194,
  "partySize": 2
}
```

### Step B — `app.js`

```javascript
app.use(express.json());  // body becomes req.body (like jsonDecode)
app.use('/api', apiRoutes);
```

### Step C — `routes/index.js`

```javascript
router.use('/trips', requireAuth, tripsRoutes);
// Every /api/trips/* request must pass requireAuth first
```

### Step D — `middleware/requireAuth.js`

```javascript
// Checks Authorization header
// Sets req.user = { uid: 'abc123', email: '...' }
// Like: if user not logged in, return 401
```

### Step E — `routes/trips.routes.js`

```javascript
router.post('/', tripsController.createTrip);
// POST /api/trips → createTrip function
```

### Step F — `controllers/trips.controller.js`

```javascript
function createTrip(req, res, next) {
  validateTripBody(req.body);           // check required fields
  const trip = tripStore.createTrip({
    ...req.body,
    userId: req.user.uid,              // from auth middleware
  });
  res.status(201).json({ trip });      // send JSON back to Flutter
}
```

### Step G — `services/tripStore.js`

```javascript
// Saves trip in a Map (like a in-memory list)
// Later we replace this with MongoDB — same idea as Hive → real DB
```

### Step H — Flutter receives:

```json
{
  "trip": {
    "id": "uuid-here",
    "userId": "abc123",
    "airportIata": "SFO",
    "status": "SEARCHING",
    ...
  }
}
```

---

## 5. HTTP Methods (Quick Reference)

| Method | Meaning | Flutter analogy | Example |
|--------|---------|-----------------|--------|
| **GET** | Read data | `repository.getTrips()` | List all trips |
| **POST** | Create new | `repository.createTrip()` | New trip |
| **PUT** | Update existing | `repository.updateProfile()` | Update user |
| **DELETE** | Remove | `repository.deleteAccount()` | Delete trip |

---

## 6. Status Codes (What Numbers Mean)

| Code | Meaning | When we use it |
|------|---------|----------------|
| **200** | OK | GET success |
| **201** | Created | POST success (new trip) |
| **400** | Bad request | Missing field, invalid party size |
| **401** | Unauthorized | No token / bad token |
| **404** | Not found | Trip ID doesn't exist |
| **500** | Server error | Unexpected crash |

---

## 7. Try It Yourself (Lesson 1 — 10 minutes)

### Start the server

```bash
cd backend
cp .env.example .env    # if not done yet
npm install
npm run dev
```

You should see:
```
AirMatch API running on http://localhost:3000
SKIP_AUTH=true — using demo-user for local development
```

### Test with curl (like Postman, but terminal)

**Health check (no auth):**
```bash
curl http://localhost:3000/api/health
```

**Create a trip:**
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "airportIata": "SFO",
    "arrivalAt": "2026-06-20T14:30:00.000Z",
    "destinationLabel": "Downtown SF",
    "destinationLat": 37.7749,
    "destinationLng": -122.4194,
    "partySize": 2
  }'
```

**List trips:**
```bash
curl http://localhost:3000/api/trips
```

Copy the `id` from create response, then:

**Find matches:**
```bash
curl http://localhost:3000/api/trips/PASTE_ID_HERE/matches
```

If you see JSON back — **your backend works.**

---

## 8. Lesson 2 — Add a Simple Endpoint (Practice)

We will add `GET /api/trips/airport/:code` — list trips for one airport (e.g. SFO).

**Files to touch (always this order):**

1. **Service** — add `listTripsByAirport(code)` in `tripStore.js`
2. **Controller** — add `getTripsByAirport(req, res)` in `trips.controller.js`
3. **Route** — add `router.get('/airport/:code', ...)` in `trips.routes.js`
4. **Test** — `curl http://localhost:3000/api/trips/airport/SFO`

Same pattern every time you add a feature.

---

## 9. Why In-Memory Store First?

```javascript
const trips = new Map();  // lives in RAM
```

- **Pros:** Zero setup, easy to read, perfect for learning
- **Cons:** Data disappears when server restarts

**Later (Step 8 in roadmap):** Replace with **MongoDB** — controllers and routes stay almost the same; only `tripStore.js` changes (like swapping Hive for a remote API).

---

## 10. Glossary

| Term | Meaning |
|------|---------|
| **API** | Backend URLs Flutter calls |
| **Endpoint** | One URL + method, e.g. `GET /api/trips` |
| **JSON** | Data format `{ "key": "value" }` — same as Dart Map |
| **Express** | Web framework (like Flutter is a UI framework) |
| **Middleware** | Function that runs before your controller |
| **Controller** | Handles one request, sends one response |
| **Service** | Business rules (matching, validation logic) |
| **Store / Repository** | Read/write data |
| **CORS** | Allows Flutter (different origin) to call API |
| **Bearer token** | Firebase ID token in `Authorization` header |

---

## 11. Common Mistakes

| Mistake | Fix |
|---------|-----|
| Server not running | `npm run dev` in `backend/` |
| Flutter can't connect | Android emulator: `http://10.0.2.2:3000` |
| 401 Unauthorized | Set `SKIP_AUTH=true` in `.env` for local dev |
| Changes not showing | Save file — `--watch` auto-restarts |
| Empty trips after restart | Normal — in-memory store resets |

---

## Next: Follow [ROADMAP.md](../../docs/ROADMAP.md) step by step.

Each step builds one feature on **both** Flutter and backend together.
