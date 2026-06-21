# AirMatch — Product Requirements Document (PRD)

| Field | Value |
|-------|-------|
| **Product** | AirMatch |
| **Version** | 1.2 (Phase 1 — Auth) |
| **Status** | In Development |
| **Last Updated** | June 18, 2026 |
| **Owner** | Product / Engineering |

---

## 1. Executive Summary

**AirMatch** is a mobile platform that connects travelers arriving at the same airport who are heading toward similar destinations, enabling them to share ground transportation (rideshare, taxi, shuttle, or private car). The product reduces cost, wait time, and environmental impact while improving safety through verified profiles and in-app coordination.

The MVP targets iOS and Android via a **Flutter** client backed by a **Node.js** API, with **Firebase Authentication** for identity, **Firebase Cloud Messaging** for real-time alerts, and a matching engine that pairs travelers based on airport, arrival window, destination proximity, and travel preferences.

---

## 2. Problem Statement

### 2.1 User Pain Points

| Pain Point | Impact |
|------------|--------|
| Solo airport transfers are expensive | Travelers pay full fare for rides they could split |
| Long taxi/ride queues after landing | Fatigue and missed connections |
| Uncertainty about safe ride-sharing with strangers | Hesitation to coordinate informally |
| No purpose-built tool for airport-specific matching | Generic ride-share apps don't optimize for flight arrivals |
| Language and timezone friction | Hard to coordinate ad hoc at unfamiliar airports |

### 2.2 Opportunity

Airports concentrate high-intent travelers with shared destinations within a narrow time window. A dedicated matching layer — aware of terminals, arrival times, and destination zones — can unlock efficient shared rides that generic platforms miss.

---

## 3. Vision & Goals

### 3.1 Vision

*Make every airport arrival an opportunity to travel smarter together.*

### 3.2 Product Goals (12 months)

| Goal | Target |
|------|--------|
| Successful shared rides completed | 10,000 |
| Match-to-ride conversion rate | ≥ 25% |
| Average cost savings per rider | ≥ 30% |
| App store rating | ≥ 4.5 |
| Critical safety incidents | 0 tolerated; < 0.01% report rate |

### 3.3 Non-Goals (MVP)

- In-app payment processing (users coordinate payment externally in MVP)
- Driver marketplace / professional chauffeur dispatch
- Multi-leg itinerary planning across cities
- Web client (mobile-only for MVP)
- Real-time GPS tracking of vehicles (phase 2)

---

## 4. Target Users & Personas

### 4.1 Primary Personas

#### Persona A — Budget-Conscious Solo Traveler (Alex, 28)
- Frequent leisure traveler, price-sensitive
- Lands at major hub, needs ride to downtown hotel
- Comfortable sharing ride with verified stranger
- **Jobs to be done:** Find a match quickly, split fare, feel safe

#### Persona B — Business Traveler (Morgan, 42)
- Values punctuality and professionalism
- Prefers premium vehicle class, flexible on cost
- **Jobs to be done:** Reliable match within tight schedule, minimal friction

#### Persona C — Group Arrival Coordinator (Sam, 35)
- Traveling with family; may have extra seat capacity or need one
- **Jobs to be done:** Match by party size and luggage needs

### 4.2 Secondary Stakeholders

| Stakeholder | Interest |
|-------------|----------|
| Airport authorities | Reduced curbside congestion |
| Ride providers (Uber/Lyft/local taxi) | Referral / deep-link handoff (phase 2) |
| Trust & Safety team | Identity verification, reporting |

---

## 5. User Stories & Acceptance Criteria

### 5.1 Authentication & Onboarding

AirMatch uses **Firebase Authentication** as the single identity provider. The Flutter app signs users in; the Node.js backend verifies Firebase ID tokens on every protected API call.

#### 5.1.1 Sign-In Methods (MVP)

| Method | Priority | Platform | Notes |
|--------|----------|----------|-------|
| **Google Sign-In** | P0 | Android, iOS | Primary social login; one-tap onboarding |
| **Email / Password** | P0 | Android, iOS | Sign up + sign in with email verification (phase 1) |
| Apple Sign-In | P1 | iOS only | Required for App Store if other social logins exist |
| Phone OTP | P1 | Android, iOS | Trust badge; post-MVP for matching |

#### 5.1.2 Google Sign-In — Requirements

| ID | Requirement |
|----|-------------|
| GOOG-01 | "Continue with Google" button on login screen |
| GOOG-02 | Uses `google_sign_in` → Firebase credential → `signInWithCredential` |
| GOOG-03 | On success, user profile synced to backend via `POST /api/users/me` |
| GOOG-04 | ID token attached to all API requests (`Authorization: Bearer <token>`) |
| GOOG-05 | Sign out clears Google session + Firebase session + local token |
| GOOG-06 | Android: `google-services.json` + SHA-1 fingerprint in Firebase Console |
| GOOG-07 | iOS: `GoogleService-Info.plist` + reversed client ID URL scheme |

#### 5.1.3 Auth Flow

```
App Launch
  → Splash
  → Firebase authStateChanges()
       ├── signed in  → sync profile → Home
       └── signed out → Login (Google + Email)
```

#### 5.1.4 User Stories

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| AUTH-01 | As a new user, I want to sign up with **Google** or email so I can create a profile quickly | P0 | Google Sign-In works on Android & iOS; email sign-up creates Firebase user |
| AUTH-02 | As a user, I want to verify my phone number so others trust my identity | P1 | SMS OTP via Firebase; verified badge on profile |
| AUTH-03 | As a user, I want to complete a profile (photo, name, languages) so matches can assess compatibility | P0 | Name + photo from Google account shown; optional fields before first match |
| AUTH-04 | As a signed-in user, I want to sign out from the app | P0 | Sign out returns to Login; API token no longer sent |
| AUTH-05 | As a user, my API calls must be secure | P0 | Backend rejects missing/invalid Firebase tokens on protected routes |

### 5.2 Trip Intent

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| TRIP-01 | As a traveler, I want to select my arrival airport and terminal | P0 | Airport search with IATA codes; terminal optional |
| TRIP-02 | As a traveler, I want to enter my flight number so arrival time is auto-populated | P1 | Flight lookup API integration; manual fallback |
| TRIP-03 | As a traveler, I want to set my destination (address or zone) | P0 | Geocoded destination; zone clustering for matching |
| TRIP-04 | As a traveler, I want to specify party size and luggage | P0 | 1–6 passengers; luggage tiers (carry-on, checked) |
| TRIP-05 | As a traveler, I want to set vehicle preference (economy, XL, premium) | P1 | Preference stored; used in match scoring |

### 5.3 Matching

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| MATCH-01 | As a traveler, I want to see compatible matches near my arrival time | P0 | List ranked by score; refresh every 60s |
| MATCH-02 | As a traveler, I want to understand why someone is a good match | P0 | Score breakdown: time overlap, destination proximity, preferences |
| MATCH-03 | As a traveler, I want to send a match request | P0 | Request notifies other user via FCM |
| MATCH-04 | As a traveler, I want to accept/decline requests | P0 | State machine: pending → accepted / declined / expired |
| MATCH-05 | As matched users, we want a shared chat to coordinate pickup | P0 | In-app messaging tied to match session |

### 5.4 Notifications & Deep Links

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| NOTIF-01 | As a user, I want push notifications for match events | P0 | FCM for request, accept, message, reminder |
| NOTIF-02 | As a user, tapping a notification opens the relevant screen | P0 | Deep links: `airmatch://match/{id}`, `airmatch://chat/{id}` |

### 5.5 Safety & Trust

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| SAFE-01 | As a user, I want to report or block another user | P0 | Report flow; block prevents future matching |
| SAFE-02 | As a user, I want to see verification status on profiles | P0 | Email, phone, photo badges |
| SAFE-03 | As a user, I want safety tips before meeting | P1 | Modal on first match accept |

### 5.6 Account & Settings

| ID | User Story | Priority | Acceptance Criteria |
|----|------------|----------|---------------------|
| SET-01 | As a user, I want to manage notification preferences | P1 | Toggle per event type |
| SET-02 | As a user, I want to delete my account and data | P0 | GDPR-style deletion within 30 days |

---

## 6. Functional Requirements

### 6.1 Matching Algorithm (MVP)

The matching engine scores candidate pairs using weighted factors:

```
MatchScore =
  (0.35 × TimeOverlap) +
  (0.30 × DestinationProximity) +
  (0.15 × PartySizeFit) +
  (0.10 × VehiclePreferenceAlign) +
  (0.10 × TrustScore)
```

| Factor | Definition |
|--------|------------|
| **TimeOverlap** | Overlap of arrival windows (± configurable buffer, default 45 min) |
| **DestinationProximity** | Haversine distance or geohash zone equality |
| **PartySizeFit** | Combined party ≤ vehicle capacity |
| **VehiclePreferenceAlign** | Exact or adjacent tier match |
| **TrustScore** | Verification completeness, rating, account age |

**Threshold:** Only surface matches with `MatchScore ≥ 0.65`.

### 6.2 Match Session Lifecycle

```
DRAFT → SEARCHING → MATCH_PENDING → MATCHED → IN_RIDE → COMPLETED
                              ↓           ↓
                          DECLINED    CANCELLED
```

| State | Description |
|-------|-------------|
| DRAFT | User editing trip intent, not yet published |
| SEARCHING | Active trip visible to matching engine |
| MATCH_PENDING | Request sent, awaiting response (expires in 15 min) |
| MATCHED | Both parties accepted; chat unlocked |
| IN_RIDE | Either party marks ride started (optional MVP) |
| COMPLETED | Ride marked complete; optional rating prompt |
| DECLINED / CANCELLED | Terminal states |

### 6.3 Real-Time & Offline Behavior

- Match list cached locally (**Hive**) for offline viewing; stale after 5 minutes
- Chat messages queued offline and synced on reconnect
- FCM delivers push; app fetches full payload via REST on open

---

## 7. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Cold start < 2.5s; match list API p95 < 800ms |
| **Availability** | API 99.5% uptime (MVP) |
| **Scalability** | Support 50k DAU; horizontal Node.js scaling |
| **Security** | TLS 1.2+; JWT via Firebase; OWASP Mobile Top 10 mitigations |
| **Privacy** | Encrypt PII at rest; location precision reduced to ~500m for matching |
| **Accessibility** | WCAG 2.1 AA for core flows |
| **Localization** | English MVP; i18n-ready architecture |
| **Analytics** | Firebase Analytics + custom events for funnel tracking |

---

## 8. Information Architecture & Navigation

```
Splash
 └── Auth (Login / Register / Social)
      └── Onboarding (Profile setup)
           └── Home (Active Trip / Create Trip)
                ├── Match Discovery
                │    ├── Match Detail
                │    └── Send Request
                ├── My Matches
                │    ├── Match Detail (accepted)
                │    └── Chat
                ├── Trip History
                └── Profile & Settings
                     ├── Edit Profile
                     ├── Notifications
                     ├── Safety Center
                     └── Delete Account
```

---

## 9. Wireframe Descriptions (Key Screens)

### 9.1 Home — Active Trip Card
- Airport code, arrival ETA, destination summary
- CTA: "Find Matches" or "View 3 Matches"
- Status chip: Searching / Matched / Completed

### 9.2 Match Discovery
- Scrollable cards: avatar, name, verification badges, score %, destination zone, arrival delta
- Filter chips: time window, vehicle type
- Pull-to-refresh

### 9.3 Match Detail
- Full profile, trip comparison side-by-side, score breakdown
- Actions: Request Match / Decline

### 9.4 Chat
- Standard messaging UI, quick-reply chips ("At baggage claim", "On my way", "Running 10 min late")

---

## 10. Data Model (Conceptual)

| Entity | Key Fields |
|--------|------------|
| **User** | id, firebaseUid, displayName, photoUrl, phoneVerified, emailVerified, trustScore, createdAt |
| **Trip** | id, userId, airportIata, terminal, arrivalAt, destinationLat/Lng, destinationLabel, partySize, luggage, vehiclePref, status |
| **MatchRequest** | id, fromTripId, toTripId, status, score, expiresAt |
| **MatchSession** | id, tripAId, tripBId, chatChannelId, status |
| **Message** | id, sessionId, senderId, body, sentAt |
| **Report** | id, reporterId, reportedUserId, reason, createdAt |

---

## 11. Integrations

| Integration | Purpose | MVP |
|-------------|---------|-----|
| Firebase Auth | Identity | Yes |
| Firebase Cloud Messaging | Push notifications | Yes |
| FlightAware / AviationStack | Flight lookup | P1 |
| Google Maps / Places | Geocoding, airport data | Yes |
| Node.js REST API | Business logic, matching | Yes |
| Stripe | Payments | No (phase 2) |

---

## 12. Analytics & KPIs

### 12.1 Funnel Events

| Event | Properties |
|-------|------------|
| `trip_created` | airport, has_flight_number |
| `match_list_viewed` | count, avg_score |
| `match_request_sent` | score |
| `match_accepted` | time_to_accept_ms |
| `chat_message_sent` | session_id |
| `ride_completed` | estimated_savings |

### 12.2 North Star Metric

**Weekly Completed Shared Rides (WCSR)** — number of match sessions reaching `COMPLETED` per week.

---

## 13. Monetization (Post-MVP)

| Model | Description |
|-------|-------------|
| Commission | % of facilitated ride value (requires in-app payments) |
| Premium | Priority matching, wider time windows |
| B2B | Airport partnership dashboards |

MVP is **free** to maximize liquidity and validate matching quality.

---

## 14. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Low match liquidity at small airports | High | High | Launch at 3 hub airports; seed with marketing |
| Safety incident | Low | Critical | Verification, reporting, safety education, insurance review |
| Flight delay breaks matches | Medium | Medium | Dynamic time-window expansion; re-match prompt |
| GDPR / privacy complaints | Low | High | Data minimization, deletion flow, DPA with vendors |
| Abuse / spam requests | Medium | Medium | Rate limits, blocks, trust score |

---

## 15. Release Plan

### Phase 0 — Foundation (Weeks 1–4) — **Complete**
- ✅ Monorepo split into `airmatch-flutter` + `airmatch-backend`
- ✅ Flutter Clean Architecture scaffold (BLoC, Dio, GetIt)
- ✅ Backend trips API + matching engine (in-memory)
- ✅ Firebase Auth + Google Sign-In (Flutter + backend token verify)
- ⬜ CI/CD pipeline

### Phase 1 — MVP (Weeks 5–10)
- Matching engine, discovery UI, requests, chat
- FCM, deep linking
- Launch: SFO, LAX, JFK

### Phase 2 — Growth (Weeks 11–16)
- Flight API, ratings, safety center enhancements
- Additional airports

### Phase 3 — Monetization (Weeks 17+)
- In-app payments, premium tier

---

## 16. Open Questions

| # | Question | Owner | Due |
|---|----------|-------|-----|
| 1 | Minimum verification for matching — phone only or photo required? | Product | Week 2 |
| 2 | Chat: custom vs third-party (Stream, Sendbird)? | Engineering | Week 3 |
| 3 | Legal review for peer ride coordination by jurisdiction | Legal | Week 4 |
| 4 | Match expiry window — 15 min vs 30 min? | Product | Week 5 |

---

## 17. Appendix

### 17.1 Glossary

| Term | Definition |
|------|------------|
| **Trip Intent** | A user's published arrival + destination plan |
| **Match Session** | Mutual acceptance binding two trip intents |
| **Zone** | Geohash or predefined area for destination clustering |
| **Trust Score** | Composite reputation metric (0–1) |

### 17.2 Related Documents

| Document | Location |
|----------|----------|
| Flutter app repo | [github.com/jaydeepdodiya/airmatch-flutter](https://github.com/jaydeepdodiya/airmatch-flutter) |
| Backend API repo | [github.com/jaydeepdodiya/airmatch-backend](https://github.com/jaydeepdodiya/airmatch-backend) |
| Project overview | [github.com/jaydeepdodiya/airmatch](https://github.com/jaydeepdodiya/airmatch) |

---

## 18. Repository Structure

```
airmatch/                    ← docs & overview (this PRD)
airmatch-flutter/            ← Flutter mobile app
airmatch-backend/            ← Node.js REST API
```

Each repo is developed and deployed independently. The Flutter app calls the backend over HTTPS (HTTP in local dev).

---

## 19. Flutter App — Technical Scope

### 19.1 Stack

| Layer | Technology |
|-------|------------|
| UI | Flutter 3.x, Material 3 |
| State | flutter_bloc |
| Architecture | Clean Architecture (presentation → domain → data) |
| DI | get_it |
| HTTP | dio |
| Local cache (planned) | hive |
| Auth | firebase_auth, google_sign_in | ✅ Phase 1 |
| Push (planned) | firebase_messaging |

### 19.2 Folder Structure

```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── di/injection.dart
│   ├── network/dio_client.dart
│   ├── theme/app_theme.dart
│   └── error/failures.dart
├── config/api_config.dart
└── features/
    ├── splash/
    ├── home/
    └── trips/
        ├── data/        → API models, remote datasource, repo impl
        ├── domain/      → entities, repository contracts, use cases
        └── presentation/ → BLoC, pages, widgets
```

### 19.3 Phase 0 — Completed

| Item | Status |
|------|--------|
| Clean Architecture scaffold | ✅ |
| GetIt + Dio setup | ✅ |
| Splash → Home navigation | ✅ |
| Home: API health check | ✅ |
| Trips: create + list + find matches | ✅ |
| Unit test for Home BLoC | ✅ |

### 19.4 Phase 1 — Auth (In Progress)

| Item | Status |
|------|--------|
| Firebase Core initialization | ✅ |
| Google Sign-In | ✅ |
| Email / password sign-in & sign-up | ✅ |
| Auth gate (Splash → Login or Home) | ✅ |
| Dio Bearer token interceptor | ✅ |
| Sign out from Home | ✅ |
| Profile onboarding (full) | ⬜ |
| Apple Sign-In | ⬜ |

### 19.5 Firebase Setup (required once)

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods → **Google** + **Email/Password**
3. Install FlutterFire CLI: `dart pub global activate flutterfire_cli`
4. Run from `flutter/`: `flutterfire configure`
5. Add Android SHA-1 (debug): `cd android && ./gradlew signingReport`
6. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) — auto-placed by FlutterFire

### 19.6 Phase 2 — Next

| Item | Priority |
|------|----------|
| Profile onboarding screen | P0 |
| Hive offline cache for trips | P1 |
| FCM push notifications | P0 |
| Deep linking (`airmatch://match/{id}`) | P0 |
| Apple Sign-In (iOS) | P1 |

### 19.7 Local API URL

| Platform | Base URL |
|----------|----------|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Physical device | Your machine's LAN IP, e.g. `http://192.168.1.10:3000` |

Override at build time: `--dart-define=API_BASE_URL=http://10.0.2.2:3000`

---

## 20. Backend API — Technical Scope

### 20.1 Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 20+ |
| Framework | Express 4 |
| Storage (Phase 0) | In-memory (learning-friendly; resets on restart) |
| Storage (Phase 1) | MongoDB or PostgreSQL |
| Auth | Firebase Admin SDK (verify ID tokens) | ✅ Phase 1 |

### 20.2 Folder Structure

```
src/
├── server.js
├── app.js
├── config/env.js
├── routes/
├── controllers/
├── services/       → business logic (matching, trip store)
├── middleware/
└── utils/
```

### 20.3 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Service health check |
| GET | `/api/users/me` | Yes | Get current user profile |
| PUT | `/api/users/me` | Yes | Update / sync profile after login |
| GET | `/api/trips` | Yes | List active trips |
| POST | `/api/trips` | Yes | Create a trip intent |
| GET | `/api/trips/:id` | Yes | Get trip by ID |
| GET | `/api/trips/:id/matches` | Yes | Find compatible trips |

**Auth header:** `Authorization: Bearer <Firebase ID token>`

**Local dev bypass:** set `SKIP_AUTH=true` in `backend/.env` to use `demo-user` without Firebase (testing only).

### 20.4 Trip — Request Body (`POST /api/trips`)

```json
{
  "airportIata": "SFO",
  "terminal": "2",
  "arrivalAt": "2026-06-20T14:30:00.000Z",
  "destinationLabel": "Downtown San Francisco",
  "destinationLat": 37.7749,
  "destinationLng": -122.4194,
  "partySize": 2,
  "luggage": "checked",
  "vehiclePref": "economy"
}
```

### 20.5 Match Response Shape

```json
{
  "tripId": "abc-123",
  "matches": [
    {
      "trip": { "id": "...", "airportIata": "SFO", "..." },
      "score": 0.82,
      "breakdown": {
        "timeOverlap": 0.9,
        "destinationProximity": 0.85,
        "partySizeFit": 1.0,
        "vehiclePreferenceAlign": 1.0,
        "trustScore": 0.5
      }
    }
  ]
}
```

Only matches with `score >= 0.65` are returned (per §6.1).

### 20.6 Phase 1 — Completed / In Progress

| Item | Status |
|------|--------|
| Firebase Admin token middleware | ✅ |
| Users profile (`GET/PUT /api/users/me`) | ✅ |
| Trips scoped to authenticated user | ✅ |
| MongoDB persistence | ⬜ |
| Match requests (pending → accept/decline) | ⬜ |
| Chat messages endpoint | ⬜ |
| Rate limiting | ⬜ |

### 20.7 Firebase Admin Setup

1. Firebase Console → Project Settings → Service accounts → Generate new private key
2. Save as `backend/serviceAccountKey.json` (gitignored)
3. Set in `backend/.env`: `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json`
4. Or set `SKIP_AUTH=true` for local dev without Firebase
