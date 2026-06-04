import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "src", "data");
const dest = join(root, "dist", "data");

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
console.log("Copied src/data → dist/data");

const releasesSrc = join(root, "releases", "android");
const releasesDest = join(root, "dist", "releases", "android");
try {
  mkdirSync(releasesDest, { recursive: true });
  cpSync(releasesSrc, releasesDest, { recursive: true });
  console.log("Copied releases/android → dist/releases/android");
} catch (e) {
  console.warn("releases/android skip:", e.message);
}
