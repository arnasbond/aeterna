import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isCommitLabel } from "./is-commit-label";

let cached: string | null | undefined;

/** Įrašyta `npm run build` metu — veikia net jei runtime env tuščias. */
export function getEmbeddedCommit(): string | null {
  if (cached !== undefined) return cached;
  try {
    const raw = readFileSync(join(process.cwd(), "public", "commit-hash.txt"), "utf8").trim();
    if (isCommitLabel(raw)) {
      cached = raw.toLowerCase();
      return cached;
    }
  } catch {
    /* failas dar ne sugeneruotas (dev) */
  }
  cached = null;
  return null;
}
