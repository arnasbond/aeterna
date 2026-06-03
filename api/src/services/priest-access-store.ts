import { createHash, randomBytes, randomUUID } from "node:crypto";
import { config } from "../config.js";
import type { PriestAccessRequest, PriestAccessRequestInput } from "../types/aeterna.js";
import { getParish } from "./aeterna-store.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";
import { createAdminSession, getAdminFromTokenSync, resolveAdminFromToken as resolveAdminSessionInKv } from "./admin-session-store.js";

/** Laikina — pašalinti prieš production (žr. config.testLoginEnabled) */
export function isTestLoginPassword(password: string): boolean {
  return config.testLoginEnabled && password.trim() === config.testLoginPassword;
}

const REQUESTS_KEY = "priest-access-requests";
const CREDENTIALS_KEY = "priest-credentials";

const ADMIN_PASSWORD = process.env.AETERNA_ADMIN_PASSWORD || "admin-aeterna-2026";
const PASSWORD_SALT = process.env.AETERNA_PASSWORD_SALT || "aeterna-priest-v1";
const TEMP_PASSWORD_TTL_MS = Number(process.env.PRIEST_TEMP_PASSWORD_HOURS || 72) * 60 * 60 * 1000;

type PriestCredential = {
  id: string;
  requestId: string;
  parishId: string;
  passwordHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};

let requestsCache: PriestAccessRequest[] | null = null;
let credentialsCache: PriestCredential[] | null = null;

function hashPassword(plain: string): string {
  return createHash("sha256").update(`${PASSWORD_SALT}:${plain}`).digest("hex");
}

function generateTempPassword(): string {
  const raw = randomBytes(6).toString("hex").toUpperCase();
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

async function loadRequests(): Promise<PriestAccessRequest[]> {
  if (requestsCache) return requestsCache;
  requestsCache = await loadJsonStore<PriestAccessRequest[]>(REQUESTS_KEY, []);
  return requestsCache;
}

async function saveRequests(): Promise<void> {
  await saveJsonStore(REQUESTS_KEY, requestsCache ?? []);
}

async function loadCredentials(): Promise<PriestCredential[]> {
  if (credentialsCache) return credentialsCache;
  credentialsCache = await loadJsonStore<PriestCredential[]>(CREDENTIALS_KEY, []);
  return credentialsCache;
}

async function saveCredentials(): Promise<void> {
  await saveJsonStore(CREDENTIALS_KEY, credentialsCache ?? []);
}

export async function isApprovedPriestEmail(parishId: string, email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const requests = await loadRequests();
  return requests.some(
    (r) => r.parishId === parishId && r.email === normalized && r.status === "approved"
  );
}

export async function submitPriestAccessRequest(
  input: PriestAccessRequestInput
): Promise<PriestAccessRequest> {
  const parish = getParish(input.parishId);
  if (!parish) throw new Error("Parapija nerasta");

  const requests = await loadRequests();
  const pending = requests.find(
    (r) => r.parishId === input.parishId && r.email.toLowerCase() === input.email.trim().toLowerCase() && r.status === "pending"
  );
  if (pending) {
    throw new Error("Šiai parapijai jau yra laukianti patvirtinimo užklausa su šiuo el. paštu");
  }

  const row: PriestAccessRequest = {
    id: randomUUID(),
    parishId: input.parishId,
    parishTitle: parish.title,
    priestName: input.priestName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    note: input.note?.trim() || null,
    status: "pending",
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  };
  requests.push(row);
  await saveRequests();
  return row;
}

export async function listPriestAccessRequests(): Promise<PriestAccessRequest[]> {
  const requests = await loadRequests();
  return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function approvePriestAccessRequest(requestId: string): Promise<{
  request: PriestAccessRequest;
  temporaryPassword: string;
  expiresAt: string;
}> {
  const requests = await loadRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error("Užklausa nerasta");
  if (req.status !== "pending") throw new Error("Užklausa jau peržiūrėta");

  const plain = generateTempPassword();
  const expiresAt = new Date(Date.now() + TEMP_PASSWORD_TTL_MS).toISOString();
  const credentials = await loadCredentials();

  credentials.push({
    id: randomUUID(),
    requestId: req.id,
    parishId: req.parishId,
    passwordHash: hashPassword(plain),
    expiresAt,
    usedAt: null,
    createdAt: new Date().toISOString(),
  });

  req.status = "approved";
  req.reviewedAt = new Date().toISOString();
  await saveCredentials();
  await saveRequests();

  return { request: req, temporaryPassword: plain, expiresAt };
}

export async function rejectPriestAccessRequest(requestId: string): Promise<PriestAccessRequest> {
  const requests = await loadRequests();
  const req = requests.find((r) => r.id === requestId);
  if (!req) throw new Error("Užklausa nerasta");
  if (req.status !== "pending") throw new Error("Užklausa jau peržiūrėta");
  req.status = "rejected";
  req.reviewedAt = new Date().toISOString();
  await saveRequests();
  return req;
}

export async function verifyPriestTemporaryPassword(
  parishId: string,
  password: string
): Promise<boolean> {
  const credentials = await loadCredentials();
  const now = Date.now();
  const hash = hashPassword(password.trim());

  const match = credentials.find(
    (c) =>
      c.parishId === parishId &&
      c.passwordHash === hash &&
      !c.usedAt &&
      new Date(c.expiresAt).getTime() > now
  );

  if (!match) return false;

  match.usedAt = new Date().toISOString();
  await saveCredentials();
  return true;
}

export async function adminLogin(password: string): Promise<string | null> {
  if (!config.requirePasswords) {
    return createAdminSession();
  }
  if (password !== ADMIN_PASSWORD && !isTestLoginPassword(password)) return null;
  return createAdminSession();
}

export function getAdminFromToken(token: string | undefined): boolean {
  return getAdminFromTokenSync(token);
}

export async function resolveAdminFromToken(token: string | undefined): Promise<boolean> {
  return resolveAdminSessionInKv(token);
}
