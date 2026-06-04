# Vercel ekranas „Let's build something new“ — ką spausti

## NESPAUSKITE

- Create Empty Project
- Clone Template (Next.js Boilerplate ir kt.)

## SPAUSKITE

**Import Git Repository** (viduje — **GitHub**)

1. Jei GitHub pilkas — **Manage Login Connections** → prijunkite GitHub.
2. Sąraše raskite: **`arnasbond/aeterna`**
3. **Import**

## Kitas ekranas (svarbu)

| Laukas | Reikšmė |
|--------|---------|
| Project Name | `aeterna-web` (bet koks) |
| **Root Directory** | **`web`** ← Edit → įrašykite `web` |
| Framework | Next.js |

## Environment Variables

Pridėkite prieš Deploy:

```
API_INTERNAL_URL=https://api-three-chi-63.vercel.app
NEXT_PUBLIC_API_URL=https://api-three-chi-63.vercel.app
```

Po pirmo deploy pridėkite (su savo URL):

```
NEXT_PUBLIC_SITE_URL=https://JŪSŲ-PROJEKTAS.vercel.app
```

ir **Redeploy**.

## Deploy → Ready

Patikra: `https://JŪSŪ-URL.vercel.app/paieska` — ne 404.

## Kompiuteryje prieš import

Dvigubas paspaudimas:

`H:\dev\aeterna\VERCEL-IMPORT-DABAR.bat`

(įkelia kodą į GitHub)
