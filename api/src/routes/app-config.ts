import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { FastifyInstance } from "fastify";
import { publicApiUrl, publicWebUrl } from "../public-urls.js";
import { resolveAndroidReleaseDir } from "../release-paths.js";

async function readManifest(dir: string) {
  const raw = (await readFile(join(dir, "update.json"), "utf8")).replace(/^\uFEFF/, "");
  return JSON.parse(raw) as {
    versionCode: number;
    versionName: string;
    releaseNotes?: string;
    required?: boolean;
  };
}

export async function appConfigRoutes(app: FastifyInstance) {
  /** Vienas šaltinis tiesai — Android/WebView automatiškai naudoja šį adresą. */
  app.get("/api/v1/app/config", async (req) => {
    const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
    const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
    let webAppUrl = publicWebUrl();
    if (webAppUrl.includes("aeterna-mauve.vercel.app")) {
      webAppUrl = "https://aeterna-web-six.vercel.app";
    }
    const apiBaseUrl = publicApiUrl(hostHeader, proto);

    let minVersionCode = 1;
    let latestVersionName = "0.1.0";
    const releaseDir = await resolveAndroidReleaseDir();
    if (releaseDir) {
      try {
        const manifest = await readManifest(releaseDir);
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
        sameOriginApi: webAppUrl.startsWith("https://") && !apiBaseUrl.includes(":4000"),
      },
    };
  });

  app.get("/api/v1/app/android/update", async (req, reply) => {
    const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
    const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
    const apiHost = publicApiUrl(hostHeader, proto);
    let webUrl = publicWebUrl();
    if (webUrl.includes("aeterna-mauve.vercel.app")) {
      webUrl = "https://aeterna-web-six.vercel.app";
    }

    let versionCode = 1;
    let versionName = "0.1.0-dev";
    let releaseNotes = "";
    let required = false;

    const releaseDir = await resolveAndroidReleaseDir();
    if (releaseDir) {
      try {
        const manifest = await readManifest(releaseDir);
        versionCode = manifest.versionCode;
        versionName = manifest.versionName;
        releaseNotes = manifest.releaseNotes ?? "";
        required = manifest.required ?? false;
      } catch {
        /* ignore */
      }
    }

    const apkFile = releaseDir ? join(releaseDir, "aeterna.apk") : "";
    const localApk = Boolean(releaseDir && apkFile);
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
        apkAvailable: localApk || versionCode > 1,
        webAppUrl: webUrl,
      },
    };
  });

  app.get("/api/v1/app/android/download", async (_req, reply) => {
    const releaseDir = await resolveAndroidReleaseDir();
    const apkFile = releaseDir ? join(releaseDir, "aeterna.apk") : null;
    if (apkFile) {
      try {
        await readFile(apkFile);
        reply.header("Content-Type", "application/vnd.android.package-archive");
        reply.header("Content-Disposition", 'attachment; filename="aeterna.apk"');
        return reply.send(createReadStream(apkFile));
      } catch {
        /* fall through */
      }
    }

    return reply.status(404).send({
      success: false,
      error: { message: "APK dar neįkeltas. Paleiskite PATIKRA-IR-SURINKTI.bat" },
    });
  });
}
