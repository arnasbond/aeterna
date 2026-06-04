import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

function gitShortSha() {
  try {
    return execSync("git rev-parse --short=7 HEAD", { encoding: "utf8" }).trim().toLowerCase();
  } catch {
    return "";
  }
}

const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT_SHA || "").trim();
let label = gitShortSha() || "local";
if (sha.length >= 7 && /^[0-9a-f]+$/i.test(sha)) {
  label = sha.slice(0, 7).toLowerCase();
} else if (!label || label === "local") {
  if (process.env.VERCEL === "1") label = gitShortSha() || "unknown";
}

const out = join(process.cwd(), "public", "commit-hash.txt");
writeFileSync(out, label + "\n", "utf8");
console.log("[build] commit-hash.txt =", label);
