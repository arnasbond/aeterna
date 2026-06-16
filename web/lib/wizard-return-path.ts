/** Grąžinimo kelias į vedlys po prisijungimo — išsaugo query (from=candle, parish, …). */
export function buildWizardReturnPath(params: { toString(): string }): string {
  const q = params.toString().trim();
  return q ? `/wizard?${q}` : "/wizard";
}
