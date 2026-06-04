import { writeFileSync } from "node:fs";
import { join } from "node:path";

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || "").trim();
let label = "local";
if (sha.length >= 7 && /^[0-9a-f]+$/i.test(sha)) {
  label = sha.slice(0, 7).toLowerCase();
} else if (process.env.VERCEL === "1") {
  label = "unknown";
}

const out = join(process.cwd(), "public", "commit-hash.txt");
writeFileSync(out, label + "\n", "utf8");
console.log("[build] commit-hash.txt =", label);
