import { buildApp } from "../dist/build-app.js";

let appPromise = null;

async function getApp() {
  if (!appPromise) appPromise = buildApp();
  return appPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
