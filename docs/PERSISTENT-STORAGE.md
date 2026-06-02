# Nuolatinė saugykla (Vercel)

Pranešimai tarp parapijos administratoriaus ir AETERNA admin saugomi JSON formatu. Lokaliai — aplankas `api/data/`. Vercel’e — **KV** arba **Blob**.

## Rekomenduojama: Vercel KV (Upstash)

**Produkcijoje jau sukurta:** duomenų bazė `aeterna-kv` (Frankfurt), prijungta prie API projekto.

Patikrinimas: https://api-three-chi-63.vercel.app/health → `"jsonStore": "kv"`

### Naujai (kitam projektui arba lokaliai)

```powershell
cd api
.\scripts\setup-kv.ps1
```

Arba rankiniu būdu:

1. [Vercel Dashboard](https://vercel.com) → projektas **API**
2. **Storage** / `vercel install upstash/upstash-kv --name aeterna-kv`
3. **Connect to Project** → API
4. `vercel deploy --prod` (api aplankas)

Automatiškai atsiras:

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

## Alternatyva: Vercel Blob

1. **Storage** → **Blob** → sukurkite store
2. **Connect to Project** → API projektas
3. Atsiras `BLOB_READ_WRITE_TOKEN`

Jei nustatyti ir KV, ir Blob — naudojamas **KV**.

## Patikrinimas

Atidarykite:

`https://api-three-chi-63.vercel.app/health`

Laukas `jsonStore` turi būti `"kv"` arba `"blob"`, ne `"filesystem"`.

## Lokaliai

Be env kintamųjų failai rašomi į `api/data/` (arba `DATA_DIR`).

```powershell
cd api
npm run dev
```

## Migracija iš /tmp

Jei prieš įjungiant KV/Blob jau buvo pranešimų Vercel `/tmp`, po pirmo skaitymo su nauja saugykla sistema bando perkelti duomenis iš lokalaus failo į debesį (jei debesyje tuščia).
