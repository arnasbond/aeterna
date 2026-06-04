import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));

/** Vercel serverless dažnai turi tik dist/ — releases kopijuojami į dist/releases. */
export async function resolveAndroidReleaseDir(): Promise<string | null> {
  const cwd = process.cwd();
  const candidates = [
    join(cwd, "releases", "android"),
    join(cwd, "dist", "releases", "android"),
    join(moduleDir, "..", "releases", "android"),
    join(moduleDir, "releases", "android"),
    join(cwd, "..", "web", "public", "releases"),
  ];
  for (const dir of candidates) {
    try {
      await access(join(dir, "update.json"));
      return dir;
    } catch {
      /* next */
    }
  }
  return null;
}
