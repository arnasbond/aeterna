import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";

const RELEASE_DIR = join(process.cwd(), "releases", "android");
const MANIFEST_FILE = join(RELEASE_DIR, "update.json");
const APK_FILE = join(RELEASE_DIR, "aeterna.apk");

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function appUpdateRoutes(app: FastifyInstance) {
  app.get("/api/v1/app/android/update", async (req, reply) => {
    if (!(await fileExists(MANIFEST_FILE))) {
      return reply.status(404).send({
        success: false,
        error: { message: "Android atnaujinimo manifestas nerastas. Paleiskite build-apk.ps1" },
      });
    }

    const raw = (await readFile(MANIFEST_FILE, "utf8")).replace(/^\uFEFF/, "");
    const manifest = JSON.parse(raw) as {
      versionCode: number;
      versionName: string;
      releaseNotes?: string;
      required?: boolean;
    };

    const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
    const proto = req.headers["x-forwarded-proto"] ?? req.protocol;
    const apkUrl = `${proto}://${hostHeader}/api/v1/app/android/download`;

    return {
      success: true,
      data: {
        versionCode: manifest.versionCode,
        versionName: manifest.versionName,
        releaseNotes: manifest.releaseNotes ?? "",
        required: manifest.required ?? false,
        apkUrl,
        apkAvailable: await fileExists(APK_FILE),
      },
    };
  });

  app.get("/api/v1/app/android/download", async (_req, reply) => {
    if (!(await fileExists(APK_FILE))) {
      return reply.status(404).send({
        success: false,
        error: { message: "APK failas dar neįkeltas. Paleiskite android/build-apk.ps1" },
      });
    }

    reply.header("Content-Type", "application/vnd.android.package-archive");
    reply.header("Content-Disposition", 'attachment; filename="aeterna.apk"');
    return reply.send(createReadStream(APK_FILE));
  });
}
