/** Platformos aptarnavimo mokestis žvakutėms ir Šv. Mišoms (€) */
export const SERVICE_FEE_EUR = 0.5;
export const SERVICE_FEE_CENTS = 50;

export const INSTITUTIONAL_LEGAL_NOTICE =
  "Platformos techninį aptarnavimą, duomenų saugumą (BDAR) ir mokėjimų apdorojimą užtikrina platformos operatorius. Parapijos ir Kurija neprisiima teisinės ar finansinės atsakomybės už svetainės techninį veikimą. Kilus klausimams ar esant nesklandumams, kreipkitės el. paštu: pagalba@aeterna.lt";

/** Archidiecezijos finansų kontrolės eksportui */
export type DonationAuditEntry = {
  timestamp: string;
  referenceId: string;
  donorName: string;
  parishDestinationAccount: string;
  kind: "mass" | "candle";
  parishAmountCents: number;
};

export function formatEurAmount(eur: number): string {
  return `${eur.toFixed(2).replace(/\.00$/, "")} €`;
}
