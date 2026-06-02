# Nuolatinė saugykla (Vercel)

Pranešimai tarp parapijos administratoriaus ir AETERNA admin saugomi JSON formatu. Lokaliai — aplankas `api/data/`. Vercel’e — **KV** arba **Blob**.

## Rekomenduojama: Vercel KV (Upstash)

1. [Vercel Dashboard](https://vercel.com) → projektas **API** (`api-three-chi-63` arba jūsų API projektas)
2. **Storage** → **Create Database** → **KV**
3. Pavadinimas pvz. `aeterna-kv` → **Connect to Project** → pasirinkite API projektą
4. Perdeploy’inkite API (arba palaukite automatinio deploy po `git push`)

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
