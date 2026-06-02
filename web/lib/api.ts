export type Parish = {
  id: string;
  title: string;
  diocese: string;
  image: string;
  bankAccount: string;
  supportGoal: string;
  deaneryId: string;
  deaneryName: string;
  lat: number;
  lng: number;
  city?: string;
  websiteUrl?: string;
  source?: string;
  sourceUrl?: string;
};

export type ParishProfileSection = { title: string; body: string };

export type ParishProfile = {
  parishId: string;
  shortDescription: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  priestName: string;
  deputyPriestName: string;
  massSchedule: string;
  confessionTimes: string;
  officeHours: string;
  sacraments: string;
  announcements: string;
  bankDetails: string;
  galleryUrls: string[];
  extraSections: ParishProfileSection[];
  importedFrom: string | null;
  importedAt: string | null;
  updatedAt: string;
};

export type ParishDetail = Parish & { profile: ParishProfile };

export type ParishProfileInput = Partial<
  Omit<ParishProfile, "parishId" | "importedFrom" | "importedAt" | "updatedAt">
>;

export type ParishMapPoint = Pick<
  Parish,
  "id" | "title" | "diocese" | "deaneryId" | "deaneryName" | "lat" | "lng" | "city"
>;

export type DeaneryFeatureProperties = {
  id: string;
  name: string;
  diocese: string;
};

export type MapData = {
  deaneries: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: DeaneryFeatureProperties;
      geometry: { type: "Polygon"; coordinates: number[][][] };
    }>;
  };
  parishes: ParishMapPoint[];
};

export type MemorialPublic = {
  id: string;
  slug: string;
  parishId: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  biography: string;
  portraitUrl?: string | null;
  farewellMessage?: string | null;
  mediaGallery: string[];
  videoUrl: string | null;
  geoLocation: { lat: number; lng: number } | null;
  privacyStatus: string;
  qrCodeUrl: string | null;
  profileUrl: string;
  parish: Pick<Parish, "id" | "title" | "diocese" | "supportGoal" | "image">;
};

export function resolveApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (env) return env.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const { protocol, hostname, origin } = window.location;
    const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
    const isLan = /^192\.168\.|^10\.|^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

    if (protocol === "https:" || (!isLocalHost && !isLan)) {
      return origin.replace(/\/$/, "");
    }

    if (!isLocalHost) {
      return `${protocol}//${hostname}:4000`;
    }
  }
  return "http://127.0.0.1:4000";
}

function base(): string {
  if (typeof window === "undefined") {
    const internal = process.env.API_INTERNAL_URL?.trim();
    if (internal) return internal.replace(/\/$/, "");
    return process.env.NEXT_PUBLIC_API_URL?.trim() || "http://127.0.0.1:4000";
  }
  return resolveApiBase();
}

async function parse<T>(r: Response): Promise<T> {
  const j = await r.json();
  if (!r.ok || j.success === false) {
    throw new Error(j.error?.message || `HTTP ${r.status}`);
  }
  return j.data as T;
}

export async function fetchParishes(): Promise<Parish[]> {
  const r = await fetch(`${base()}/api/v1/parishes`, { cache: "no-store" });
  return parse<Parish[]>(r);
}

export async function fetchParish(id: string): Promise<ParishDetail | null> {
  const r = await fetch(`${base()}/api/v1/parishes/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (r.status === 404) return null;
  return parse<ParishDetail>(r);
}

export async function fetchMapData(): Promise<MapData> {
  const r = await fetch(`${base()}/api/v1/map`, { cache: "no-store" });
  return parse<MapData>(r);
}

export async function searchParishes(query: string): Promise<Parish[]> {
  const q = encodeURIComponent(query);
  const r = await fetch(`${base()}/api/v1/parishes/search?q=${q}`, { cache: "no-store" });
  return parse<Parish[]>(r);
}

export async function fetchMemorial(slug: string): Promise<MemorialPublic | null> {
  const r = await fetch(`${base()}/api/v1/memorials/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (r.status === 404) return null;
  return parse<MemorialPublic>(r);
}

export type CreateMemorialPayload = {
  parishId: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  biography?: string;
  videoUrl?: string;
  privacyStatus?: "public" | "private";
};

export async function createMemorial(payload: CreateMemorialPayload) {
  const token = getUserToken();
  const r = await fetch(`${base()}/api/v1/memorials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return parse<{ slug: string; profileUrl: string; qrCodeUrl: string | null }>(r);
}

export async function fixMemorialLocation(slug: string, lat: number, lng: number) {
  const token = getUserToken();
  const url = token
    ? `${base()}/api/v1/user/memorials/${encodeURIComponent(slug)}/location`
    : `${base()}/api/v1/memorials/${encodeURIComponent(slug)}/location`;
  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ lat, lng }),
  });
  return parse<{ geoLocation: { lat: number; lng: number } }>(r);
}

export async function checkout(parishId: string, amountCents = 14900) {
  const r = await fetch(`${base()}/api/v1/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parishId, amountCents }),
  });
  return parse<{
    sessionId: string;
    totalAmountCents: number;
    parishCommissionCents: number;
    serviceFeeCents: number;
    message: string;
  }>(r);
}

export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

export type MassSlot = {
  id: string;
  parishId: string;
  dateTime: string;
  isAvailable: boolean;
  intentions: string | null;
  bookedBy?: string | null;
  status: string;
  donationAmountCents?: number | null;
};

export type VirtualCandle = {
  id: string;
  memorialSlug: string;
  donorName: string;
  litAt: string;
  donationAmountCents: number;
};

export type PriestDashboard = {
  parish: Parish;
  finances: {
    candlesTotalCents: number;
    massesTotalCents: number;
    memorialsTotalCents: number;
    totalCents: number;
  };
  pendingMasses: number;
  upcomingSlots: number;
};

export type PriestAccessRequest = {
  id: string;
  parishId: string;
  parishTitle: string;
  priestName: string;
  email: string;
  phone: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
};

const priestTokenKey = "aeterna_priest_token";
const adminTokenKey = "aeterna_admin_token";
const userTokenKey = "aeterna_user_token";

export type UserAccount = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
};

export type OwnedMemorial = {
  id: string;
  slug: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  parishId: string;
  profileUrl: string;
  qrCodeUrl: string | null;
  privacyStatus: string;
  updatedAt: string;
};

export type OwnedMemorialDetail = {
  id: string;
  slug: string;
  userId: string;
  parishId: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  biography: string;
  portraitUrl?: string | null;
  farewellMessage?: string | null;
  mediaGallery: string[];
  videoUrl: string | null;
  geoLocation: { lat: number; lng: number } | null;
  privacyStatus: string;
  profileUrl: string;
  qrCodeUrl: string | null;
};

export type UpdateMemorialPayload = {
  fullName?: string;
  birthDate?: string | null;
  deathDate?: string | null;
  biography?: string;
  farewellMessage?: string | null;
  videoUrl?: string | null;
  portraitUrl?: string | null;
  mediaGallery?: string[];
  privacyStatus?: "public" | "private";
};

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(userTokenKey);
}

export function setUserToken(token: string) {
  localStorage.setItem(userTokenKey, token);
}

export function clearUserToken() {
  localStorage.removeItem(userTokenKey);
}

function userHeaders(): HeadersInit {
  const t = getUserToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function userRegister(payload: {
  fullName: string;
  email: string;
  password: string;
  passwordConfirm: string;
}) {
  const r = await fetch(`${base()}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<{ user: UserAccount; token: string }>(r);
}

export async function userLogin(email: string, password: string) {
  const r = await fetch(`${base()}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return parse<{ user: UserAccount; token: string }>(r);
}

export async function fetchUserMe() {
  const r = await fetch(`${base()}/api/v1/auth/me`, {
    headers: userHeaders(),
    cache: "no-store",
  });
  return parse<UserAccount>(r);
}

export async function fetchUserMemorials() {
  const r = await fetch(`${base()}/api/v1/user/memorials`, {
    headers: userHeaders(),
    cache: "no-store",
  });
  return parse<OwnedMemorial[]>(r);
}

export async function fetchUserMemorial(slug: string) {
  const r = await fetch(`${base()}/api/v1/user/memorials/${encodeURIComponent(slug)}`, {
    headers: userHeaders(),
    cache: "no-store",
  });
  if (r.status === 404) return null;
  return parse<OwnedMemorialDetail>(r);
}

export async function updateUserMemorial(slug: string, payload: UpdateMemorialPayload) {
  const r = await fetch(`${base()}/api/v1/user/memorials/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...userHeaders() },
    body: JSON.stringify(payload),
  });
  return parse<OwnedMemorialDetail>(r);
}

export async function createUserMemorial(payload: CreateMemorialPayload) {
  const r = await fetch(`${base()}/api/v1/user/memorials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...userHeaders() },
    body: JSON.stringify(payload),
  });
  return parse<{ slug: string; profileUrl: string; qrCodeUrl: string | null }>(r);
}

export async function fixUserMemorialLocation(slug: string, lat: number, lng: number) {
  const r = await fetch(`${base()}/api/v1/user/memorials/${encodeURIComponent(slug)}/location`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...userHeaders() },
    body: JSON.stringify({ lat, lng }),
  });
  return parse<{ geoLocation: { lat: number; lng: number } }>(r);
}

export function getPriestToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(priestTokenKey);
}

export function setPriestToken(token: string) {
  localStorage.setItem(priestTokenKey, token);
}

export function clearPriestToken() {
  localStorage.removeItem(priestTokenKey);
}

function priestHeaders(): HeadersInit {
  const t = getPriestToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function fetchAvailableMasses(parishId: string) {
  const r = await fetch(`${base()}/api/v1/masses/available?parishId=${encodeURIComponent(parishId)}`, {
    cache: "no-store",
  });
  return parse<MassSlot[]>(r);
}

export async function bookMass(payload: {
  massId: string;
  intentions: string;
  donorName: string;
  amountCents?: number;
}) {
  const r = await fetch(`${base()}/api/v1/masses/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<MassSlot>(r);
}

export async function findMemorialForCandle(fullName: string, birthDate: string, deathDate: string) {
  const r = await fetch(`${base()}/api/v1/candles/find`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, birthDate, deathDate }),
  });
  return parse<{ slug: string; profileUrl: string }>(r);
}

export async function lightCandle(payload: {
  memorialSlug: string;
  donorName: string;
  amountCents: number;
}) {
  const r = await fetch(`${base()}/api/v1/candles/light`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<VirtualCandle>(r);
}

export async function fetchMemorialCandles(slug: string) {
  const r = await fetch(`${base()}/api/v1/memorials/${encodeURIComponent(slug)}/candles`, {
    cache: "no-store",
  });
  return parse<VirtualCandle[]>(r);
}

export async function submitPriestAccessRequest(payload: {
  parishId: string;
  priestName: string;
  email: string;
  phone?: string;
  note?: string;
}) {
  const r = await fetch(`${base()}/api/v1/priest/access-request`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parse<{ id: string; message: string }>(r);
}

export async function priestLogin(parishId: string, password: string) {
  const r = await fetch(`${base()}/api/v1/priest/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parishId, password }),
  });
  return parse<{ token: string; parishId: string }>(r);
}

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(adminTokenKey);
}

export function setAdminToken(token: string) {
  localStorage.setItem(adminTokenKey, token);
}

export function clearAdminToken() {
  localStorage.removeItem(adminTokenKey);
}

function adminHeaders(): HeadersInit {
  const t = getAdminToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function adminLogin(password: string) {
  const r = await fetch(`${base()}/api/v1/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return parse<{ token: string }>(r);
}

export async function fetchPriestAccessRequests() {
  const r = await fetch(`${base()}/api/v1/admin/priest-requests`, {
    headers: adminHeaders(),
    cache: "no-store",
  });
  return parse<PriestAccessRequest[]>(r);
}

export async function approvePriestRequest(id: string) {
  const r = await fetch(`${base()}/api/v1/admin/priest-requests/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    headers: adminHeaders(),
  });
  return parse<{
    request: PriestAccessRequest;
    temporaryPassword: string;
    expiresAt: string;
    message: string;
  }>(r);
}

export async function rejectPriestRequest(id: string) {
  const r = await fetch(`${base()}/api/v1/admin/priest-requests/${encodeURIComponent(id)}/reject`, {
    method: "POST",
    headers: adminHeaders(),
  });
  return parse<PriestAccessRequest>(r);
}

export async function fetchPriestDashboard() {
  const r = await fetch(`${base()}/api/v1/priest/dashboard`, {
    headers: priestHeaders(),
    cache: "no-store",
  });
  return parse<PriestDashboard>(r);
}

export async function fetchPriestMasses() {
  const r = await fetch(`${base()}/api/v1/priest/masses`, {
    headers: priestHeaders(),
    cache: "no-store",
  });
  return parse<MassSlot[]>(r);
}

export async function createPriestMassSlot(dateTime: string) {
  const r = await fetch(`${base()}/api/v1/priest/masses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...priestHeaders() },
    body: JSON.stringify({ dateTime }),
  });
  return parse<MassSlot>(r);
}

export async function confirmPriestMass(massId: string) {
  const r = await fetch(`${base()}/api/v1/priest/masses/${massId}/confirm`, {
    method: "PATCH",
    headers: priestHeaders(),
  });
  return parse<MassSlot>(r);
}

export async function fetchPriestParishProfile() {
  const r = await fetch(`${base()}/api/v1/priest/parish-profile`, {
    headers: priestHeaders(),
    cache: "no-store",
  });
  return parse<ParishDetail>(r);
}

export async function savePriestParishProfile(input: ParishProfileInput) {
  const r = await fetch(`${base()}/api/v1/priest/parish-profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...priestHeaders() },
    body: JSON.stringify(input),
  });
  return parse<ParishProfile>(r);
}

export async function importPriestParishFromWebsite(url?: string) {
  const r = await fetch(`${base()}/api/v1/priest/parish-profile/import-website`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...priestHeaders() },
    body: JSON.stringify(url ? { url } : {}),
  });
  return parse<{ profile: ParishProfile; message: string }>(r);
}

export function formatEuro(cents: number) {
  return new Intl.NumberFormat("lt-LT", { style: "currency", currency: "EUR" }).format(cents / 100);
}
