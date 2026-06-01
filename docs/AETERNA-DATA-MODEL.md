# AETERNA — duomenų bazės schema (PostgreSQL)

## parishes

Žr. ankstesnį modelį — parapijos su `bank_account`, `support_goal`.

## aeterna_memorials

Atminimo profiliai (QR, biografija, GPS).

## mass_schedule

```sql
CREATE TABLE mass_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  date_time TIMESTAMPTZ NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  intentions TEXT,
  booked_by TEXT,
  status TEXT NOT NULL DEFAULT 'open',  -- open | pending | confirmed
  donation_amount_cents INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## virtual_candles

```sql
CREATE TABLE virtual_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id UUID NOT NULL REFERENCES aeterna_memorials(id),
  parish_id UUID NOT NULL REFERENCES parishes(id),
  donor_name TEXT NOT NULL,
  lit_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  donation_amount_cents INT NOT NULL
);
```

## donations

Vieninga aukų lentelė (memorial paketai, žvakutės, mišios):

- `kind`: memorial | candle | mass
- Žvakutės / mišios: 100% → parapija (MVP)
- Memorial paketai: 20% / 80% split

## priest_accounts (planuojama)

Klebono prisijungimas prie `parish_id`.
