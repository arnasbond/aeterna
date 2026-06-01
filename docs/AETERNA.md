# AETERNA — produkto specifikacija

## Esmė

SaaS platforma skaitmeniniams atminimo puslapiams velioniams (QR ant paminklo) su **paramos modeliu parapijoms**.

## Vartotojo kelionė

1. **Registracija** — planuojama (MVP: be auth)
2. **Wizard:** duomenys → media → parapija → apmokėjimas
3. **QR** — automatinis generavimas (MVP: PNG per API)
4. **GPS** — „Fiksuoti vietą“ prie kapo; lankytojams „Naviguoti iki kapo“

## Parama

- 20% parapijai / 80% platformai (`AETERNA_PARISH_COMMISSION_BPS=2000`)
- Admin suvestinė: `GET /api/v1/admin/summary`

## UI/UX

- Šviesus, pastoralus (#4a6741, #fcfbf7)
- Playfair Display + Inter
- Mobile-first, dideli mygtukai

## Technologijos

| Sluoksnis | Stack |
|-----------|--------|
| Front | Next.js 15 |
| API | Fastify (Node) |
| DB (planuojama) | PostgreSQL |
| Mokėjimai (planuojama) | Stripe / Paysera |
| Media (planuojama) | S3 / GCS / IPFS |

## MVP būsena

- [x] Landing, parapijos, wizard, profilis, GPS
- [x] **Virtualios žvakutės** (paieška + uždegimas + profilyje)
- [x] **Šv. Mišių užsakymas** (laisvi laikai + intencija)
- [x] **Klebono skydas** (`/priest/login` — demo slaptažodis `klebonas2026`)
- [x] API + JSON saugykla
- [ ] PostgreSQL
- [ ] Tikri mokėjimai (Stripe/Paysera Split)
- [ ] QR PDF 300 DPI
- [ ] Registracija
