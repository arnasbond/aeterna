# Vercel.com — žingsnis po žingsnio (jūs atidarėte paskyrą)

## 1. Importuoti projektą

1. **Add New… → Project**
2. **Import Git Repository** — pasirinkite **GitHub** ir repozitoriją **aeterna** (arba sukurkite naują ir įkelkite kodą).
3. Jei repo dar nėra GitHub — kompiuteryje:

```powershell
cd H:\dev\aeterna
git init
git add -A
git commit -m "AETERNA pradzia"
gh repo create aeterna --public --source=. --push
```

## 2. Svarbiausias nustatymas — Root Directory

Prieš Deploy:

| Laukas | Reikšmė |
|--------|---------|
| **Root Directory** | `web` |
| Framework Preset | Next.js (auto) |
| Build Command | `npm run build` (default) |
| Output | (palikite auto) |

Be **`web`** gausite 404 ir seną titulinį.

## 3. Environment Variables (Settings → Environment Variables)

Pridėkite **Production** (ir Preview):

| Pavadinimas | Reikšmė |
|-------------|---------|
| `API_INTERNAL_URL` | `https://api-three-chi-63.vercel.app` |
| `NEXT_PUBLIC_API_URL` | `https://api-three-chi-63.vercel.app` |
| `NEXT_PUBLIC_SITE_URL` | `https://JŪSŲ-PROJEKTO.vercel.app` (po pirmo deploy) |

Pirmą kartą `NEXT_PUBLIC_SITE_URL` galite palikti tuščią — po deploy įrašykite tikrą URL ir **Redeploy**.

## 4. Deploy

Spauskite **Deploy** → palaukite **Ready** (3–8 min).

## 5. Patikra

Naršyklėje (pakeiskite domeną į savo):

- `https://JŪSŲ-PROJEKTO.vercel.app/paieska` — **ne 404**
- Tituliniame — **Ieškoti atminties**
- Apačioje — **Svetainės versija:** (raidės/skaičiai, ne `local`)

Kompiuteryje:

```powershell
cd H:\dev\aeterna
.\patikrinti-vercel.ps1
```

(Pakeiskite `$base` skripte į savo URL, jei ne `aeterna-web-six`.)

## 6. API projektas (atskirai)

Jei API dar ne Vercel:

- Atskiras projektas, **Root Directory** = `api`
- Build: `npm run build` | Start: `npm start`
- Env: `PUBLIC_WEB_URL` = jūsų web URL

Arba naudokite esamą **api-three-chi-63.vercel.app**.

## 7. Android programėlė

Kai žinomas galutinis web URL, atnaujinkite:

`android/gradle.properties`:

```properties
WEB_APP_URL=https://JŪSŲ-PROJEKTO.vercel.app
```

Tada:

```powershell
cd android
.\build-apk.ps1
```

Telefone: **Naudoti debesį** → **Perkrauti iš serverio**.

## 8. Jei build Failed

Vercel → Deployment → **Building** log. Dažniausiai:

- Root Directory ne `web`
- Trūksta env `API_INTERNAL_URL`
- TypeScript klaida — paleiskite lokaliai: `cd web && npm run build`
