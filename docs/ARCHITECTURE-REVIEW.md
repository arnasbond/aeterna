# AETERNA — Architectural Summary for External AI Review

**Repository:** `unmute/` (GitHub: `arnasbond/aeterna`)  
**Production:** Web `https://aeterna-web-six.vercel.app` · API `https://api-three-chi-63.vercel.app`  
**Stack:** Next.js 15 (App Router) + Fastify 5 (TypeScript)  
**Database:** No Prisma / Supabase / Airtable / PostgreSQL — JSON in Vercel KV

---

## 0. High-Level Architecture

```
┌─────────────────┐     HTTPS /api/v1/*      ┌──────────────────────────┐
│  Next.js (web/) │ ───────────────────────► │  Fastify API (api/)      │
│  App Router     │                          │  persistent-json-store   │
└─────────────────┘                          │  KV → Blob → filesystem  │
                                             └──────────────────────────┘
```

- **Web:** Client fetch via `web/lib/api.ts` (`NEXT_PUBLIC_API_URL`)
- **API:** JSON documents in **Vercel KV (Upstash)**, key prefix `aeterna:{store-key}`
- **Static parish data:** `api/src/data/lt-parishes.ts` + GeoJSON deaneries
- **Demo memorial:** slug `ona-demo` from `api/src/data/demo-aeterna.ts`

---

## 1. File & Folder Structure

*(Excludes node_modules, .next, dist, .git, Android build artifacts)*

```
unmute/
├── README.md
├── SUTVARKYTI-500.bat
├── PALESTI-SERVERIUS.bat
├── deploy-cloud.ps1
├── .github/workflows/vercel-deploy.yml
├── docs/
│   ├── AETERNA.md
│   ├── AETERNA-DATA-MODEL.md
│   ├── ARCHITECTURE.md
│   ├── ARCHITECTURE-REVIEW.md   ← šis failas
│   ├── ANDROID-APK.md
│   └── DEPLOY-CLOUD.md
├── scripts/
│   ├── e2e-deep-test.ps1
│   └── ensure-next-cache.ps1
├── api/
│   ├── package.json
│   ├── vercel.json
│   ├── index.js
│   ├── seeds/
│   │   ├── aeterna-memorials.json
│   │   ├── parish-profiles.json
│   │   └── users.json
│   ├── scripts/
│   │   ├── restore-parish-profiles.ts
│   │   ├── import-parish-profiles.ts
│   │   └── import-katalikai-parishes.ts
│   └── src/
│       ├── index.ts
│       ├── build-app.ts
│       ├── bootstrap-data.ts
│       ├── config.ts
│       ├── data/
│       │   ├── demo-aeterna.ts
│       │   ├── lt-parishes.ts
│       │   ├── katalikai-parishes.json
│       │   └── lt-deaneries.geojson
│       ├── routes/
│       │   ├── index.ts
│       │   ├── user.ts
│       │   ├── priest.ts
│       │   ├── admin.ts
│       │   ├── support.ts
│       │   └── app-update.ts
│       ├── services/
│       │   ├── persistent-json-store.ts
│       │   ├── aeterna-store.ts
│       │   ├── mass-candle-store.ts
│       │   ├── guestbook-store.ts
│       │   ├── user-store.ts
│       │   ├── parish-profile-store.ts
│       │   ├── support-message-store.ts
│       │   └── stripe-connect-mock.ts
│       └── types/
│           ├── aeterna.ts
│           ├── user.ts
│           └── guestbook.ts
├── web/
│   ├── package.json
│   ├── vercel.json
│   ├── lib/api.ts
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── chronicle-memorial.css
│   │   ├── m/[slug]/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── parishes/
│   │   ├── map/
│   │   ├── wizard/
│   │   ├── prisijungti/
│   │   ├── paskyra/atmintis/[slug]/
│   │   ├── priest/
│   │   └── admin/
│   └── components/
│       ├── MemorialProfile.tsx
│       ├── MemorialGuestbook.tsx
│       ├── VirtualCandles.tsx
│       └── memorial/
│           ├── MemorialCandleSheet.tsx
│           └── MemorialMassCalendar.tsx
└── android/                     # WebView APK
```

---

## 2. Memorial Profile (`/m/ona-demo`)

### 2.1 Routing

| Route | File | Purpose |
|-------|------|---------|
| `/m/[slug]` | `web/app/m/[slug]/page.tsx` | Fetch memorial, render profile |
| Layout | `web/app/m/[slug]/layout.tsx` | `.chronicle-memorial-page` + CSS |
| Root | `web/app/layout.tsx` | Header/footer hidden on memorial |

**Data flow:** Browser → `GET /api/v1/memorials/ona-demo` → `<MemorialProfile />`

### 2.2 Layout (`web/app/m/[slug]/layout.tsx`)

```tsx
import "../../chronicle-memorial.css";

export default function MemorialLayout({ children }: { children: React.ReactNode }) {
  return <div className="chronicle-memorial-page">{children}</div>;
}
```

### 2.3 Page (`web/app/m/[slug]/page.tsx`)

```tsx
"use client";

import { Suspense, use, useEffect, useState } from "react";
import { MemorialProfile } from "@/components/MemorialProfile";
import { fetchMemorial, fetchUserMemorial, getUserToken, type MemorialPublic } from "@/lib/api";

function MemorialInner({ slug }: { slug: string }) {
  const [memorial, setMemorial] = useState<MemorialPublic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    fetchMemorial(slug)
      .then((m) => {
        setMemorial(m);
        if (m?.geoLocation) setGeo(m.geoLocation);
      })
      .catch((e) => setError(e.message));
    if (getUserToken()) {
      fetchUserMemorial(slug)
        .then((m) => setCanEdit(!!m))
        .catch(() => setCanEdit(false));
    }
  }, [slug]);

  if (error) return <section className="ae-section" style={{ textAlign: "center" }}><p style={{ color: "#b91c1c" }}>{error}</p></section>;
  if (!memorial) return <section className="ae-section" style={{ textAlign: "center" }}>Kraunama…</section>;

  return <MemorialProfile memorial={memorial} slug={slug} geo={geo ?? memorial.geoLocation} canEdit={canEdit} />;
}

export default function MemorialPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return (
    <Suspense fallback={<section className="ae-section">Kraunama…</section>}>
      <MemorialInner slug={slug} />
    </Suspense>
  );
}
```

### 2.4 Main component (`web/components/MemorialProfile.tsx`)

Sections rendered:
1. **Header** — AETERNA logo + parish link
2. **Hero** — arch portrait, name, years, epitaph
3. **Actions** — candle button, GPS to grave
4. **Bio** — "Gyvenimo istorija" paragraphs
5. **Farewell** — blockquote from `farewellMessage`
6. **Gallery** — 2-col grid + lightbox
7. **Parish card** — mass booking toggle + `MemorialMassCalendar`
8. **Board** — `VirtualCandles` + `MemorialGuestbook`
9. **Modal** — `MemorialCandleSheet` (5€/10€/20€ pills + 0.50€ fee)

Full source: `web/components/MemorialProfile.tsx` (189 lines)

### 2.5 Subcomponents

| Component | File | Role |
|-----------|------|------|
| MemorialCandleSheet | `web/components/memorial/MemorialCandleSheet.tsx` | Bottom sheet, mock Stripe |
| VirtualCandles | `web/components/VirtualCandles.tsx` | List lit candles |
| MemorialGuestbook | `web/components/MemorialGuestbook.tsx` | Condolences (moderated) |
| MemorialMassCalendar | `web/components/memorial/MemorialMassCalendar.tsx` | Book mass slots |

### 2.6 CSS tokens (`web/app/chronicle-memorial.css`)

- Background: `#FCFBF7` (ivory)
- Emerald: `#1E3A1E`
- Gold: `#D4AF37`
- Fonts: Playfair Display (headings), Inter (body)
- Max width: 28rem, mobile-first
- Global header/footer hidden via `body:has(.chronicle-memorial-page)`

### 2.7 Component tree

```
MemorialLayout
└── MemorialPage
    └── MemorialProfile
        ├── header (logo + parish)
        ├── hero (portrait, name, years, epitaph)
        ├── actions (candle, GPS)
        ├── bio / farewell / gallery
        ├── parish card → MemorialMassCalendar
        ├── board → VirtualCandles + MemorialGuestbook
        └── MemorialCandleSheet
```

---

## 3. Data & Storage

### 3.1 No ORM

All mutable state in JSON via `api/src/services/persistent-json-store.ts`.

**Priority:**
1. Vercel KV — `KV_REST_API_URL` + `KV_REST_API_TOKEN`
2. Vercel Blob — `BLOB_READ_WRITE_TOKEN`
3. Filesystem — `DATA_DIR` or `/tmp/aeterna-data`

KV keys: `aeterna:{store-key}`

### 3.2 Store keys

| Key | Contents |
|-----|----------|
| `aeterna-memorials` | Memorial profiles |
| `aeterna-orders` | Donations / checkout |
| `aeterna-masses` | Mass schedule |
| `aeterna-candles` | Virtual candles |
| `guestbook-entries` | Guestbook messages |
| `parish-profiles` | Parish CMS (65 seeded) |
| `users` | Family accounts |
| `user-sessions` | User tokens |
| `priest-sessions` | Priest tokens |
| `priest-access-requests` | Access requests |
| `priest-credentials` | Parish passwords |
| `priest-otp` | Email OTP codes |
| `admin-sessions` | Admin tokens |
| `support-messages` | Support threads |

### 3.3 Types (`AeternaMemorial`)

```typescript
{
  id, slug, userId, parishId, fullName,
  birthDate, deathDate, biography,
  portraitUrl, farewellMessage,
  mediaGallery[], videoUrl,
  geoLocation: { lat, lng } | null,
  privacyStatus: "public" | "private",
  moderationStatus?: "pending" | "approved" | "rejected",
  qrCodeUrl, profileUrl, createdAt, updatedAt
}
```

Public API adds embedded `parish: { id, title, diocese, supportGoal, image }`.

### 3.4 Demo seed `ona-demo`

**Source:** `api/src/data/demo-aeterna.ts` + `api/seeds/aeterna-memorials.json`

```typescript
DEMO_MEMORIAL_SLUG = "ona-demo"
DEMO_MEDIA_VERSION = 5
fullName = "Stasė"
birthDate = "1936-05-12"
deathDate = "2024-12-24"
parishId = "parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika"
geoLocation = { lat: 54.6866, lng: 25.2872 }
userId = null
moderationStatus = "approved"
```

Portrait + 6 gallery images (Unsplash/Pexels). Farewell message in Lithuanian. Biography about "Močiutė Stasė".

**Refresh logic:** `aeterna-store.ts` auto-updates demo when `demoMediaVersion < DEMO_MEDIA_VERSION`.

### 3.5 Environment variables

**API:** `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `BLOB_READ_WRITE_TOKEN`, `PUBLIC_WEB_URL`, `AETERNA_REQUIRE_PASSWORDS`, `AETERNA_ADMIN_PASSWORD`, `RESEND_API_KEY`, `AETERNA_PARISH_COMMISSION_BPS` (default 2000 = 20%)

**Web:** `NEXT_PUBLIC_API_URL`, `API_INTERNAL_URL`, `NEXT_PUBLIC_AETERNA_REQUIRE_PASSWORDS`

---

## 4. Routers & API Endpoints

### 4.1 Next.js routes (web)

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/m/[slug]` | **Memorial profile** |
| `/parishes`, `/parishes/[id]` | Parish list/detail |
| `/map` | Interactive map |
| `/wizard` | Create memorial wizard |
| `/prisijungti` | User login/register |
| `/paskyra`, `/paskyra/atmintis/[slug]` | User dashboard, edit memorial |
| `/priest/login`, `/priest/dashboard`, `/priest/profile` | Priest panel |
| `/admin`, `/admin/login` | Super admin |
| `/qr-ploksteles` | QR plates |
| `/atsisiusti` | Android APK |

No Next.js API routes — all data from Fastify.

### 4.2 Fastify API

**Health:** `GET /health` → `{ status, jsonStore }`  
**Info:** `GET /api/v1`

#### Public

| Method | Path |
|--------|------|
| GET | `/api/v1/parishes` |
| GET | `/api/v1/parishes/:id` |
| GET | `/api/v1/parishes/search?q=` |
| GET | `/api/v1/map` |
| GET | `/api/v1/map/parishes?deaneryId=` |
| GET | `/api/v1/memorials/:slug` |
| GET | `/api/v1/memorials/:slug/candles` |
| GET | `/api/v1/memorials/:slug/guestbook` |
| POST | `/api/v1/memorials/:slug/guestbook` |
| POST | `/api/v1/memorials` |
| PATCH | `/api/v1/memorials/:slug/location` |
| POST | `/api/v1/checkout` |
| GET | `/api/v1/masses/available?parishId=` |
| POST | `/api/v1/masses/book` |
| POST | `/api/v1/candles/find` |
| POST | `/api/v1/candles/light` |
| GET | `/api/v1/admin/summary` |

#### User (Bearer / x-user-token)

| Method | Path |
|--------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/oauth` |
| GET | `/api/v1/auth/me` |
| GET/POST/PATCH | `/api/v1/user/memorials[...]` |
| GET/PATCH | `/api/v1/user/memorials/:slug/guestbook[...]` |

#### Priest (Bearer / x-priest-token)

| Method | Path |
|--------|------|
| POST | `/api/v1/priest/access-request` |
| POST | `/api/v1/priest/login` |
| POST | `/api/v1/priest/auth/request-code` |
| POST | `/api/v1/priest/auth/verify-code` |
| GET | `/api/v1/priest/dashboard` |
| GET/POST | `/api/v1/priest/masses` |
| PATCH | `/api/v1/priest/masses/:id/confirm` |
| GET/PUT | `/api/v1/priest/parish-profile` |
| POST | `/api/v1/priest/parish-profile/import-website` |
| GET/POST | `/api/v1/priest/support/threads[...]` |

#### Admin (Bearer / x-admin-token)

| Method | Path |
|--------|------|
| POST | `/api/v1/admin/login` |
| GET | `/api/v1/admin/priest-requests` |
| POST | `/api/v1/admin/priest-requests/:id/approve\|reject` |
| GET | `/api/v1/admin/memorials/pending` |
| POST | `/api/v1/admin/memorials/:slug/approve\|reject` |
| GET/POST/PATCH | `/api/v1/admin/support/threads[...]` |

#### Android

| Method | Path |
|--------|------|
| GET | `/api/v1/app/android/update` |
| GET | `/api/v1/app/android/download` |

### 4.3 Response format

```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "message": "..." } }
```

### 4.4 Web client (`web/lib/api.ts`)

Key functions: `fetchMemorial`, `fetchMemorialCandles`, `fetchMemorialGuestbook`, `postMemorialGuestbook`, `lightCandle`, `fetchAvailableMasses`, `bookMass`, `fetchUserMemorial`

---

## 5. MVP / Mock limitations

- Payments: `stripe-connect-mock.ts` (no real Stripe)
- OAuth: mock Google/Facebook
- Email OTP: needs `RESEND_API_KEY`
- `ona-demo` has `userId: null` — no guestbook moderation without linked account
- Parish list: static TypeScript, not DB

---

*Generated May 2026 — AETERNA external AI review packet.*
