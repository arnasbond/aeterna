import type { DonationAuditEntry } from "@/lib/financial-compliance";
import type { MassSlot, VirtualCandle } from "@/lib/api";

export function buildDonationAuditTrail(
  parishBankAccount: string,
  masses: MassSlot[],
  candles: VirtualCandle[] = []
): DonationAuditEntry[] {
  const massRows: DonationAuditEntry[] = masses
    .filter((m) => (m.donationAmountCents ?? 0) > 0 && m.status !== "open")
    .map((m) => ({
      timestamp: m.dateTime,
      referenceId: m.id,
      donorName: m.bookedBy?.trim() || "Anonimas",
      parishDestinationAccount: parishBankAccount,
      kind: "mass" as const,
      parishAmountCents: m.donationAmountCents ?? 0,
    }));

  const candleRows: DonationAuditEntry[] = candles.map((c) => ({
    timestamp: c.litAt,
    referenceId: c.id,
    donorName: c.donorName?.trim() || "Anonimas",
    parishDestinationAccount: parishBankAccount,
    kind: "candle" as const,
    parishAmountCents: c.donationAmountCents,
  }));

  return [...massRows, ...candleRows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function auditTrailToCsv(rows: DonationAuditEntry[]): string {
  const header =
    "Timestamp,Reference ID,Donor Name,Parish Destination Account,Kind,Parish Amount (EUR)";
  const lines = rows.map((r) =>
    [
      r.timestamp,
      r.referenceId,
      `"${r.donorName.replace(/"/g, '""')}"`,
      r.parishDestinationAccount,
      r.kind,
      (r.parishAmountCents / 100).toFixed(2),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}
