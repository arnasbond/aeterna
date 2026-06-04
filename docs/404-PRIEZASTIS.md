# Kodėl buvo 404 `/paieska`

Vercel build'ina iš **GitHub `main`**, ne iš `H:\dev\aeterna` disko.

- Lokaliai failas buvo: `web/app/paieska/page.tsx`
- GitHub `main` jo neturėjo → Vercel deploy neturėjo maršruto → **404**

## Pataisyta

Commit `3e1ba4e` — `git push origin main` (2026-06-04).

Po push Vercel automatiškai paleidžia naują deploy (jei projektas susietas su `arnasbond/aeterna`).

## Patikra

1. https://github.com/arnasbond/aeterna/tree/main/web/app/paieska — turi egzistuoti
2. https://aeterna-arnasbond-gmailcoms-projects.vercel.app/paieska — po **Ready** deploy

Jei vis dar 404 po 10 min: Vercel → Deployments → **Redeploy** (paskutinis commit `3e1ba4e`).
