import { createHash, randomInt, randomUUID } from "node:crypto";
import { config } from "../config.js";
import { loadJsonStore, saveJsonStore } from "./persistent-json-store.js";
import { getParish } from "./aeterna-store.js";
import { sendPriestOtpEmail } from "./email-service.js";
import { isApprovedPriestEmail } from "./priest-access-store.js";
import { createPriestSession } from "./priest-session-store.js";

const STORE_KEY = "priest-otp";
const OTP_TTL_MS = 10 * 60 * 1000;

type OtpEntry = {
  id: string;
  parishId: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  createdAt: string;
};

function hashCode(code: string): string {
  return createHash("sha256").update(`aeterna-otp:${code.trim()}`).digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 999999));
}

async function loadOtps(): Promise<OtpEntry[]> {
  return loadJsonStore<OtpEntry[]>(STORE_KEY, []);
}

async function saveOtps(entries: OtpEntry[]): Promise<void> {
  await saveJsonStore(STORE_KEY, entries);
}

export async function requestPriestOtp(
  parishId: string,
  email: string
): Promise<{ sent: boolean; message: string; devCode?: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) throw new Error("Neteisingas el. paštas");

  const approved = await isApprovedPriestEmail(parishId, normalized);
  if (config.requirePasswords && !approved) {
    throw new Error(
      "El. paštas nepatvirtintas. Pateikite prieigos užklausą ir laukite administratoriaus patvirtinimo."
    );
  }

  const code = generateCode();
  const now = Date.now();
  const entries = (await loadOtps()).filter((e) => new Date(e.expiresAt).getTime() > now);
  entries.push({
    id: randomUUID(),
    parishId,
    email: normalized,
    codeHash: hashCode(code),
    expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
    createdAt: new Date().toISOString(),
  });
  await saveOtps(entries);

  const parish = getParish(parishId);
  const emailed = await sendPriestOtpEmail(normalized, code, parish?.title ?? parishId);

  const showDev =
    !emailed &&
    (!config.requirePasswords || config.testLoginEnabled || process.env.AETERNA_OTP_DEV === "1");
  const message = emailed
    ? "Prisijungimo kodas išsiųstas el. paštu."
    : showDev
      ? `Kodas sugeneruotas (testavimo režimas: ${code}).`
      : "Jei el. paštas patvirtintas, prisijungimo kodas išsiųstas.";

  if (!emailed && !showDev) {
    console.info(`[priest-otp] ${normalized} @ ${parishId} code=${code}`);
  }

  return { sent: true, message, devCode: showDev ? code : undefined };
}

export async function verifyPriestOtp(
  parishId: string,
  email: string,
  code: string
): Promise<{ token: string; parishId: string } | null> {
  const normalized = email.trim().toLowerCase();
  const hash = hashCode(code);
  const now = Date.now();
  const entries = await loadOtps();
  const match = entries.find(
    (e) =>
      e.parishId === parishId &&
      e.email === normalized &&
      e.codeHash === hash &&
      new Date(e.expiresAt).getTime() > now
  );
  if (!match) return null;

  const approved = await isApprovedPriestEmail(parishId, normalized);
  if (config.requirePasswords && !approved) return null;

  await saveOtps(entries.filter((e) => e.id !== match.id));
  return createPriestSession(parishId);
}
