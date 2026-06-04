import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { isCommitLabel } from "./is-commit-label";

let cached: string | null | undefined;

function readCommitFile(path: string): string | null {
  try {
    if (!existsSync(path)) return null;
    const raw = readFileSync(path, "utf8").trim().toLowerCase();
    return isCommitLabel(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Įrašyta `npm run build` → public/commit-hash.txt */
export function getEmbeddedCommit(): string | null {
  if (cached !== undefined) return cached;

  const cwd = process.cwd();
  const candidates = [
    join(cwd, "public", "commit-hash.txt"),
    join(cwd, "web", "public", "commit-hash.txt"),
  ];

  for (const p of candidates) {
    const v = readCommitFile(p);
    if (v) {
      cached = v;
      return v;
    }
  }

  cached = null;
  return null;
}
