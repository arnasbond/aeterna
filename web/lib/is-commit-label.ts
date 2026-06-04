/** Git commit (7 simbolių hex) — ne deployment ID. */
export function isCommitLabel(label: string): boolean {
  return /^[0-9a-f]{7}$/i.test(label.trim());
}
