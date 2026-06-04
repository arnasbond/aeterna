# Vercel 404 (`/paieska`, paieška nematoma telefone)

## Priežastis

Telefonas krauna **https://aeterna-web-six.vercel.app** — tai Vercel.  
PC `localhost:3000` — tai **ne** telefonas.

Jei `/paieska` naršyklėje rodo **404**, Vercel dar **nedeployino** naujo kodo arba neteisingas **Root Directory**.

## Vercel nustatymai (vieną kartą)

1. https://vercel.com → projektas **aeterna-web** (arba panašus)
2. **Settings → General → Root Directory** = **`web`**
3. **Save**
4. **Deployments → Redeploy** → **Redeploy with existing Build Cache** = **OFF**

## Įkelti kodą

```powershell
cd H:\dev\aeterna
git add -A
git commit -m "deploy: paieska, vercel web root"
git push origin main
```

Jei `main` neegzistuoja: `git push -u origin HEAD`

## Patikra (po 3–8 min)

Naršyklėje:

- https://aeterna-web-six.vercel.app/paieska → turi būti **Ieškoti atminties**
- https://aeterna-web-six.vercel.app → po antrašte laukas **Ieškoti atminties**
- Puslapio apačioje: **Svetainės versija:** (ne `local`)

Tada telefone: programėlė → **Perkrauti iš serverio**.

## Jei vis dar 404

- Vercel **Deployments** → paskutinis build **Ready** (ne Failed)?
- Ar GitHub repo prijungtas prie to projekto?
- Ar push nuėjo į tą patį branch, kurį deployina Vercel (dažnai `main`)?
