# AirMatch — Step-by-Step Build Roadmap

Build Flutter + Backend together. Each step is small, testable, and teaches one concept.

**Legend:** ✅ Done · 🔄 Current · ⬜ Todo

---

## Step 0 — Project Setup ✅

| Flutter | Backend |
|---------|---------|
| Flutter project + Clean Architecture | Express server + folder structure |
| BLoC + GetIt + Dio | Routes + controllers + services |
| Firebase Auth + Google Sign-In | Firebase token middleware |
| Trips UI (create, list, matches) | Trips API + matching engine |
| GitHub `development` branch | GitHub `development` branch |

**You learned:** Monorepo, git in 3 repos, Firebase setup.

### Authentication — already built in Step 0 (not forgotten)

Auth is **mostly done**. Your `curl` worked **without a token** because `backend/.env` has `SKIP_AUTH=true` (local dev shortcut). The Flutter app uses the **real** Firebase flow.

#### Auth flow (how it works today)

```
┌─────────────┐                    ┌──────────────┐                    ┌─────────────┐
│   Flutter   │                    │   Firebase   │                    │   Backend   │
└──────┬──────┘                    └──────┬───────┘                    └──────┬──────┘
       │  1. Google / Email sign-in        │                                   │
       │──────────────────────────────────►│                                   │
       │  2. Returns ID token (JWT)        │                                   │
       │◄──────────────────────────────────│                                   │
       │  3. POST /api/trips + Bearer token│                                   │
       │──────────────────────────────────────────────────────────────────────►│
       │                                   │  4. requireAuth verifies token    │
       │                                   │     (or demo-user if SKIP_AUTH)   │
       │  5. JSON response                 │                                   │
       │◄──────────────────────────────────────────────────────────────────────│
```

#### What's done ✅

| Piece | Flutter | Backend |
|-------|---------|---------|
| Login screen (Google + email) | ✅ `LoginPage` | — |
| Sign up with email | ✅ | — |
| Sign out | ✅ Home app bar | — |
| Auth gate (Splash → Login or Home) | ✅ `AuthGatePage` | — |
| Firebase ID token on every API call | ✅ Dio interceptor | — |
| Verify token on protected routes | — | ✅ `requireAuth.js` |
| User profile sync after login | ✅ `PUT /api/users/me` | ✅ `users.controller` |
| Trips tied to logged-in user | ✅ via token | ✅ `userId` from token |

#### What's left for auth ⬜ (later steps)

| Item | Step | Priority |
|------|------|----------|
| Profile onboarding after first login | Step 4 | P0 |
| Test auth with `SKIP_AUTH=false` + service account | Step 4 | P0 |
| Apple Sign-In (iOS App Store) | Step 10 | P1 |
| Phone OTP verification | Post-launch | P1 |
| Email verification badge | Step 4 | P2 |

#### Why curl worked without login

```bash
# backend/.env
SKIP_AUTH=true   ← skips token check, uses demo-user
```

To test **real** auth with curl (after you add service account):

```bash
# Get token from Firebase (or from Flutter debug log), then:
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

**Bottom line:** Steps 0–6 ✅. Step 7 = push notifications (FCM) next.

---

## Step 1 — Core UI Foundation ✅

**Goal:** Reusable widgets, strings, date formatting, dark/light theme.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 1.1 | Centralize all strings | `AppStrings` full coverage | — |
| 1.2 | Date/time formatters | `DateFormatter` utility | — |
| 1.3 | Reusable widgets | `AppButton`, `AppTextField`, `AppLoading` | — |
| 1.4 | Color tokens | `AppColors` light + dark | — |
| 1.5 | Theme system | `ThemeCubit` + persist choice | — |
| 1.6 | Settings screen | Theme toggle UI | — |

**Backend this step:** Nothing new — focus on Flutter UI patterns.

**Test:** Toggle dark mode, all screens look correct.

**Learn:** ThemeCubit ≈ BLoC; `AppStrings` ≈ i18n prep.

---

## Step 2 — Understand Backend (Lesson)

**Goal:** You can read and test every existing API.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 2.1 | Read `BACKEND_LEARNING.md` | — | Study guide |
| 2.2 | Run `npm run dev` | — | Start server |
| 2.3 | Test all endpoints with curl | — | Manual QA |
| 2.4 | Trace one request in code | Follow Dio call in Flutter | Follow route → controller |

**Test:** Create trip via curl + via Flutter — same result.

**Learn:** Request flow, HTTP methods, status codes.

---

## Step 3 — Maps & Destination Picker ✅

**Goal:** Replace manual lat/lng with map picker.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 3.1 | Google Maps API keys | Android + iOS config | — |
| 3.2 | `google_maps_flutter` setup | Map widget | — |
| 3.3 | Destination picker screen | Search + pin on map | — |
| 3.4 | Wire to Create Trip | Send lat/lng from map | No change (already accepts lat/lng) |

**Test:** Pick destination on map → create trip → appears in list.

---

## Step 4 — Profile, Onboarding & Auth Polish ✅

**Goal:** Complete user profile after first login + verify full auth end-to-end.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 4.1 | Profile entity + model | `UserProfile` | Already have `userStore` |
| 4.2 | Onboarding screen (first login) | Name, languages, photo | — |
| 4.3 | Sync profile | `PUT /api/users/me` via Dio | ✅ exists |
| 4.4 | Profile screen | View / edit profile | — |
| 4.5 | Auth end-to-end test | Sign in → token → API | Set `SKIP_AUTH=false`, add `serviceAccountKey.json` |
| 4.6 | Block API without token | — | Returns 401 when no Bearer token |

**Test:** Sign in on phone → create trip → only your trips show; curl without token gets 401.

**Learn:** Full auth loop — Firebase (identity) + Backend (authorization).

---

## Step 5 — Match Requests (Accept / Decline) ✅

**Goal:** Send match request, other user accepts or declines.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 5.1 | Match request model | `MatchRequest` entity | `matchRequestStore.js` |
| 5.2 | Send request API | — | `POST /api/matches/request` |
| 5.3 | Accept/decline API | — | `PUT /api/matches/:id/respond` |
| 5.4 | Match list UI | Pending / accepted tabs | — |
| 5.5 | Match detail UI | Accept / decline buttons | — |

**Learn:** State machine (pending → accepted / declined) — same on both sides.

---

## Step 6 — Chat Between Matched Users ✅

**Architecture:** Node.js owns match sessions + auth; **Firestore** delivers live messages (production-grade, not REST polling).

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 6.1 | Message model | `Message` entity | `messageStore.js` |
| 6.2 | Send/list messages | Chat UI + BLoC | `GET/POST /api/chat/:sessionId` |
| 6.3 | Quick reply chips | UI only | — |

---

## Step 7 — Push Notifications (FCM)

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 7.1 | FCM setup | `firebase_messaging` | — |
| 7.2 | Save device token | Send token to backend | `POST /api/users/fcm-token` |
| 7.3 | Send on match event | — | Firebase Admin send |

---

## Step 8 — Database (MongoDB)

**Goal:** Data survives server restart.

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 8.1 | MongoDB Atlas free tier | — | Cloud DB |
| 8.2 | Replace `tripStore` | No change (same API) | Mongoose models |
| 8.3 | Replace `userStore` | No change | Mongoose models |

**Learn:** Store layer swap — Flutter doesn't change if API stays same.

---

## Step 9 — Polish & Performance

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 9.1 | `cached_network_image` | Avatar caching | — |
| 9.2 | Pagination | Lazy load trips | `?page=1&limit=20` |
| 9.3 | Rate limiting | — | `express-rate-limit` |
| 9.4 | Error handling polish | User-friendly messages | Consistent error JSON |

---

## Step 10 — Launch Prep ✅

| # | Task | Flutter | Backend |
|---|------|---------|---------|
| 10.1 | Store assets checklist | Release build scripts | — |
| 10.2 | Production env | `APP_ENV` + `API_BASE_URL` dart-define, launch configs | `render.yaml`, `.env.production.example` |
| 10.3 | Real auth in prod | `ApiConfig.validate()` blocks localhost in prod builds | `FIREBASE_SERVICE_ACCOUNT_JSON`, `SKIP_AUTH=false` |
| 10.4 | Release workflow | PR template + GitHub Actions CI | PR template + GitHub Actions CI |

**Bottom line:** Steps 0–10 ✅ — portfolio-ready.

---

## How to Work Each Step

```bash
# Terminal 1 — Backend (keep running while developing)
cd backend && npm run dev

# Terminal 2 — Flutter
cd flutter && flutter run
```

1. Read the step tasks above
2. Build backend first (if step has backend tasks) — test with curl
3. Build Flutter — connect with Dio
4. Test end-to-end on device/simulator
5. Commit to `development` branch
6. Move to next step

---

## Learning Resources

| Doc | Purpose |
|-----|---------|
| [backend/docs/BACKEND_LEARNING.md](../backend/docs/BACKEND_LEARNING.md) | Backend explained for Flutter devs |
| [docs/PRD.md](./PRD.md) | Full product + technical requirements |
| [backend/README.md](../backend/README.md) | Backend quick start |
