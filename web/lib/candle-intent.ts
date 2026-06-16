const KEY = "aeterna_candle_intent_v1";

export type CandleIntent = {
  fullName: string;
  birthDate: string;
  deathDate: string;
  parishId: string;
  donorName: string;
  amountCents: number;
};

export function saveCandleIntent(intent: CandleIntent) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch {
    /* quota */
  }
}

export function loadCandleIntent(): CandleIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CandleIntent;
  } catch {
    return null;
  }
}

export function clearCandleIntent() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
