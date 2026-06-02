import { access, copyFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { config } from "./config.js";

const SEED_FILES = [
  "parish-profiles.json",
  "aeterna-memorials.json",
  "priest-access-requests.json",
  "priest-credentials.json",
  "aeterna-orders.json",
  "mass-schedule.json",
  "virtual-candles.json",
  "users.json",
] as const;

export async function bootstrapDataDir(): Promise<void> {
  const seedsDir = join(process.cwd(), "seeds");
  await mkdir(config.dataDir, { recursive: true });

  for (const file of SEED_FILES) {
    const dest = join(config.dataDir, file);
    try {
      await access(dest);
      continue;
    } catch {
      /* copy from seed if present */
    }
    const seedPath = join(seedsDir, file);
    try {
      await access(seedPath);
      await copyFile(seedPath, dest);
    } catch {
      /* optional seed */
    }
  }
}
