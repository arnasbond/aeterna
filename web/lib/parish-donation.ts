/** Nuo apmokamos sumos skiriama parapijai (20 %). */

export const PARISH_DONATION_PERCENT = 20;

export function parishDonationCents(totalCents: number): number {
  return Math.round((totalCents * PARISH_DONATION_PERCENT) / 100);
}

export function formatDonationEuro(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
}

export const PARISH_DONATION_NOTE =
  "Skaitmeninės narystės ir Premium mokėjimuose 20 % sumos automatiškai skiriama pasirinktai parapijai.";

export function parishDonationNoteWithAmount(totalCents: number, parishTitle?: string): string {
  const amount = formatDonationEuro(parishDonationCents(totalCents));
  const target = parishTitle ? ` parapijai „${parishTitle}"` : " pasirinktai parapijai";
  return `Nuo apmokamos sumos ${amount} (${PARISH_DONATION_PERCENT} %) keliauja kaip auka${target}.`;
}
