import type { FastifyInstance } from "fastify";
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
      const url = await uploadMemorialMedia(data, filename, contentType);
      return { success: true, data: { url } };
    } catch (e) {
      return reply.status(400).send({
        success: false,
        error: { message: e instanceof Error ? e.message : "Nepavyko įkelti failo" },
      });
    }
  });
}
