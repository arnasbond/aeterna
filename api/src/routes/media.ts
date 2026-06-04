import type { FastifyInstance } from "fastify";
import { publicApiUrl } from "../public-urls.js";
import { loadMediaFromKv } from "../services/media-kv-store.js";
import { uploadMemorialMedia } from "../services/media-upload.js";

type UploadBody = {
  filename?: string;
  contentType?: string;
  data?: string;
};

export async function mediaRoutes(app: FastifyInstance) {
  app.post<{ Body: UploadBody }>("/api/v1/media/upload", async (req, reply) => {
    const { filename = "upload.jpg", contentType = "image/jpeg", data } = req.body ?? {};
    if (!data?.trim()) {
      return reply.status(400).send({
        success: false,
        error: { message: "Trūksta failo duomenų" },
      });
    }
    try {
      const hostHeader = req.headers.host ?? `localhost:${process.env.PORT || 4000}`;
      const proto = (req.headers["x-forwarded-proto"] as string) ?? req.protocol;
      const apiBase = publicApiUrl(hostHeader, proto);
      const url = await uploadMemorialMedia(data, filename, contentType, apiBase);
      return { success: true, data: { url } };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko įkelti failo" },
      });
    }
  });

  app.get<{ Params: { id: string } }>("/api/v1/media/file/:id", async (req, reply) => {
    const record = await loadMediaFromKv(req.params.id);
    if (!record) {
      return reply.status(404).send({ success: false, error: { message: "Failas nerastas" } });
    }
    const buf = Buffer.from(record.data, "base64");
    reply.header("Content-Type", record.contentType);
    reply.header("Cache-Control", "public, max-age=31536000, immutable");
    return reply.send(buf);
  });
}
