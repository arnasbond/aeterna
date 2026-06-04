import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { publicApiUrl, publicWebUrl } from "../public-urls.js";

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

export async function appConfigRoutes(app: FastifyInstance) {
  /** Vienas šaltinis tiesai — Android/WebView automatiškai naudoja šį adresą. */
  app.get("/api/v1/app/config", async (req) => {
    const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
    const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
    const webAppUrl = publicWebUrl();
    const apiBaseUrl = publicApiUrl(hostHeader, proto);

    let minVersionCode = 1;
    let latestVersionName = "0.1.0";
    if (await fileExists(MANIFEST_FILE)) {
      try {
        const raw = (await readFile(MANIFEST_FILE, "utf8")).replace(/^\uFEFF/, "");
        const manifest = JSON.parse(raw) as { versionCode?: number; versionName?: string };
        minVersionCode = manifest.versionCode ?? 1;
        latestVersionName = manifest.versionName ?? latestVersionName;
      } catch {
        /* ignore */
      }
    }

    const contentVersion =
      process.env.RENDER_GIT_COMMIT?.trim() ||
      process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
      process.env.BUILD_ID?.trim() ||
      latestVersionName;

    return {
      success: true,
      data: {
        webAppUrl,
        apiBaseUrl,
        minVersionCode,
        latestVersionName,
        contentVersion,
        /** Production: API ir web tame pačiame origin (Next proxy). */
        sameOriginApi: webAppUrl.startsWith("https://") && !apiBaseUrl.includes(":4000"),
      },
    };
  });

  app.get("/api/v1/app/android/update", async (req, reply) => {
    const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
    const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
    const apiHost = publicApiUrl(hostHeader, proto);
    const webUrl = publicWebUrl();

    let versionCode = 1;
    let versionName = "0.1.0-dev";
    let releaseNotes = "";
    let required = false;

    if (await fileExists(MANIFEST_FILE)) {
      const raw = (await readFile(MANIFEST_FILE, "utf8")).replace(/^\uFEFF/, "");
      const manifest = JSON.parse(raw) as {
        versionCode: number;
        versionName: string;
        releaseNotes?: string;
        required?: boolean;
      };
      versionCode = manifest.versionCode;
      versionName = manifest.versionName;
      releaseNotes = manifest.releaseNotes ?? "";
      required = manifest.required ?? false;
    }

    const localApk = await fileExists(APK_FILE);
    const webApkPath = join(process.cwd(), "../web/public/releases/aeterna.apk");
    const webApk = await fileExists(webApkPath);
    const apkUrl = localApk
      ? `${apiHost}/api/v1/app/android/download`
      : `${webUrl}/releases/aeterna.apk`;

    return {
      success: true,
      data: {
        versionCode,
        versionName,
        releaseNotes,
        required,
        apkUrl,
        apkAvailable: localApk || webApk || versionCode > 1,
        webAppUrl: webUrl,
      },
    };
  });

  app.get("/api/v1/app/android/download", async (_req, reply) => {
    if (await fileExists(APK_FILE)) {
      reply.header("Content-Type", "application/vnd.android.package-archive");
      reply.header("Content-Disposition", 'attachment; filename="aeterna.apk"');
      return reply.send(createReadStream(APK_FILE));
    }

    const webApk = join(process.cwd(), "../web/public/releases/aeterna.apk");
    if (await fileExists(webApk)) {
      reply.header("Content-Type", "application/vnd.android.package-archive");
      reply.header("Content-Disposition", 'attachment; filename="aeterna.apk"');
      return reply.send(createReadStream(webApk));
    }

    return reply.status(404).send({
      success: false,
      error: { message: "APK dar neįkeltas. Paleiskite android/build-apk.ps1" },
    });
  });
}
