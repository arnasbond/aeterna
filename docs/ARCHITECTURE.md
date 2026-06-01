# AETERNA — architektūra

```
unmute/           # repo aplankas (vėliau galima pervadinti)
  web/            # Next.js 15 — PWA, mobile-first
  api/            # Node.js + Fastify
  android/        # WebView APK (dev)
  docs/
```

## Web maršrutai

| Kelias | Paskirtis |
|--------|-----------|
| `/` | Landing |
| `/parishes` | Parapijos |
| `/wizard` | Kūrimo burtininkas |
| `/m/[slug]` | Profilis + GPS + žvakutės |
| `/priest/login` | Klebono prisijungimas |
| `/priest/dashboard` | Mišių kalendorius, finansai |

## API

| Endpoint | Paskirtis |
|----------|-----------|
| `GET /health` | Sveikata |
| `GET /api/v1/parishes` | Parapijos |
| `GET /api/v1/memorials/:slug` | Profilis |
| `POST /api/v1/memorials` | Sukurti |
| `PATCH /api/v1/memorials/:slug/location` | GPS |
| `POST /api/v1/checkout` | Mokėjimas (MVP stub) |
| `GET /api/v1/admin/summary` | Parapijų suvestinė |
| `POST /api/v1/candles/find` | Rasti profilį žvakutei |
| `POST /api/v1/candles/light` | Uždegti žvakutę |
| `GET /api/v1/masses/available` | Laisvi Mišių laikai |
| `POST /api/v1/masses/book` | Užsakyti Mišias |
| `POST /api/v1/priest/login` | Klebonas |
| `GET /api/v1/priest/dashboard` | Klebono skydas |

Duomenys MVP: `api/data/*.json` → vėliau PostgreSQL.

Žr. [AETERNA-DATA-MODEL.md](AETERNA-DATA-MODEL.md).
