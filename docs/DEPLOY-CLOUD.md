# AETERNA — nemokamas deploy (Render.com)

Visame pasaulyje pasiekiama **be įjungto kompiuterio**.

## Stack (nemokama)

| Dalis | Platforma | URL (po deploy) |
|-------|-----------|-----------------|
| Svetainė (Next.js) | Render | `https://aeterna-web.onrender.com` |
| API (Fastify) | Render | `https://aeterna-api.onrender.com` |
| Kodas | GitHub | repozitorija `aeterna` |

> **Pastaba:** Render nemokamas planas po ~15 min neaktyvumo „ užmigsta“ — pirmas atidarymas gali trukti ~30–60 s.

## Greitas deploy (vieną kartą)

### 1. Paleiskite skriptą

```powershell
cd unmute
.\deploy-cloud.ps1
```

Skriptas:
- sukuria Git repozitoriją ir įkelia į GitHub
- parodo nuorodą Render Blueprint

### 2. Render.com (nemokama paskyra)

1. Eikite į [render.com](https://render.com) → prisijunkite su GitHub
2. **New → Blueprint** → pasirinkite repozitoriją **aeterna**
3. Patvirtinkite `render.yaml` (2 paslaugos: API + Web)
4. Nustatykite **`AETERNA_ADMIN_PASSWORD`** (administratoriui `/admin/login`)
5. Spauskite **Apply**

Po ~5–10 min:
- **Svetainė:** https://aeterna-web.onrender.com
- **Demo:** https://aeterna-web.onrender.com/m/ona-demo
- **Admin:** https://aeterna-web.onrender.com/admin/login

### 3. Android APK (pasaulinis testavimas)

```powershell
cd android
.\build-apk.ps1
```

`gradle.properties` jau nurodo `WEB_APP_URL=https://aeterna-web.onrender.com` — telefonas veiks be Wi‑Fi/LAN.

## Kas įkelta į debesį

- 88 parapijos + profiliai (iš `api/seeds/`)
- Demo memorialas Ona
- Klebono / admin panelės (test slaptažodis **išjungtas** production)
- QR plokštelės, žemėlapis, wizard

## Atnaujinimai

- **Svetainė/API:** `git push` → Render automatiškai perbuildina
- **Android APK:** `build-apk.ps1` → rankinis įdiegimas arba OTA (reikia APK ant serverio)

## Lokaliai vs debesis

| | Lokaliai | Debesyje |
|---|----------|----------|
| Kompiuteris | Turi veikti | Nereikia |
| Test slaptažodis `12345678` | Taip | Ne |
| HTTP LAN | Taip | HTTPS |

## Troubleshooting

| Problema | Sprendimas |
|----------|------------|
| Puslapis lėtai kraunasi | Render free „cold start“ — palaukite minutę |
| 502 / Internal Error | Render dashboard → Logs; patikrinkite ar build sėkmingas |
| API neveikia | `https://aeterna-api.onrender.com/health` turi rodyti `ok` |
