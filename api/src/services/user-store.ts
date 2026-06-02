import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash, randomUUID } from "node:crypto";
import { join } from "node:path";
import { config } from "../config.js";
import type { UserAccount, UserPublic, UserRegisterInput } from "../types/user.js";

const USERS_FILE = join(config.dataDir, "users.json");
const PASSWORD_SALT = process.env.AETERNA_USER_PASSWORD_SALT || "aeterna-user-v1";
export const MAX_MEMORIALS_PER_USER = 7;

const userTokens = new Map<string, string>();

let usersCache: UserAccount[] | null = null;

function hashPassword(plain: string): string {
  return createHash("sha256").update(`${PASSWORD_SALT}:${plain}`).digest("hex");
}

function toPublic(user: UserAccount): UserPublic {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    createdAt: user.createdAt,
  };
}

async function loadUsers(): Promise<UserAccount[]> {
  if (usersCache) return usersCache;
  await mkdir(config.dataDir, { recursive: true });
  try {
    usersCache = JSON.parse(await readFile(USERS_FILE, "utf8")) as UserAccount[];
  } catch {
    usersCache = [];
    await saveUsers();
  }
  return usersCache;
}

async function saveUsers(): Promise<void> {
  await writeFile(USERS_FILE, JSON.stringify(usersCache ?? [], null, 2));
}

export async function registerUser(input: UserRegisterInput): Promise<{ user: UserPublic; token: string }> {
  const fullName = input.fullName?.trim();
  const email = input.email?.trim().toLowerCase();
  const password = input.password ?? "";
  const confirm = input.passwordConfirm ?? input.password ?? "";

  if (!fullName || fullName.length < 2) {
    throw new Error("Įrašykite vardą ir pavardę");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Įrašykite teisingą el. paštą");
  }
  if (password.length < 8) {
    throw new Error("Slaptažodis turi būti bent 8 simbolių");
  }
  if (password !== confirm) {
    throw new Error("Slaptažodžiai nesutampa");
  }

  const users = await loadUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error("Šis el. paštas jau registruotas. Prisijunkite arba naudokite kitą.");
  }

  const now = new Date().toISOString();
  const user: UserAccount = {
    id: randomUUID(),
    email,
    fullName,
    passwordHash: hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };
  users.push(user);
  await saveUsers();

  const token = createHash("sha256").update(`user:${user.id}:${Date.now()}:${randomUUID()}`).digest("hex");
  userTokens.set(token, user.id);
  return { user: toPublic(user), token };
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: UserPublic; token: string } | null> {
  const normalized = email.trim().toLowerCase();
  const users = await loadUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user || user.passwordHash !== hashPassword(password)) return null;

  const token = createHash("sha256").update(`user:${user.id}:${Date.now()}:${randomUUID()}`).digest("hex");
  userTokens.set(token, user.id);
  return { user: toPublic(user), token };
}

export function getUserIdFromToken(token: string | undefined): string | null {
  if (!token) return null;
  return userTokens.get(token) ?? null;
}

export async function getUserById(id: string): Promise<UserPublic | null> {
  const users = await loadUsers();
  const user = users.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}
