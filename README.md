# AETERNA

**SaaS** platforma skaitmeniniams atminimo puslapiams velioniams — pasiekiami per **QR kodą** ant paminklo. Integruota **parama parapijoms** (20% / 80%).

## Funkcijos (MVP)

- Landing ir kūrimo vedlys (4 žingsniai, grįžimas paspaudus juostą)
- Parapijų sąrašas ir paramos modelis
- Viešas profilis `/m/[slug]` + **GPS** navigacija iki kapo
- QR kodas po „apmokėjimo“ (MVP stub)
- Android WebView APK testavimui

## Greitas startas

```powershell
# Arba dukart spustelėkite PALESTI-SERVERIUS.bat
cd api
npm install
npm run dev

cd web
npm install
npm run dev:lan
```

- http://127.0.0.1:3000 — pagrindinis puslapis  
- http://127.0.0.1:3000/m/ona-demo — demo profilis  
- http://127.0.0.1:4000/health — API  

Telefonui: `npm run dev:lan` ir `web/.env.local` su PC LAN IP.

## Android APK

Žr. [docs/ANDROID-APK.md](docs/ANDROID-APK.md) · Į telefoną: **`AETERNA-install.apk`**

## Debesies deploy (nemokama, visame pasaulyje)

Žr. **[docs/DEPLOY-CLOUD.md](docs/DEPLOY-CLOUD.md)** · GitHub: [github.com/arnasbond/aeterna](https://github.com/arnasbond/aeterna)

```powershell
.\deploy-cloud.ps1   # jau įkelta — sekite Render Blueprint instrukcijas
```

Po deploy: **https://aeterna-web.onrender.com** (projekto šaknyje).

## Dokumentacija

- [AETERNA produktas](docs/AETERNA.md)
- [Duomenų modelis](docs/AETERNA-DATA-MODEL.md)
- [Architektūra](docs/ARCHITECTURE.md)
- [Android](docs/ANDROID-APK.md)

## Struktūra

```
aeterna/          # (aplankas unmute — istorinis pavadinimas)
  api/            # Fastify API
  web/            # Next.js PWA
  android/        # APK (WebView)
  docs/
```
