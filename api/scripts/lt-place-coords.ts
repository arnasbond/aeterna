/** Miestų / gyvenviečių koordinatės ir dekanato (žemėlapio srities) susiejimas */
export type PlaceInfo = {
  city: string;
  lat: number;
  lng: number;
  deaneryId: string;
  deaneryName: string;
};

/** Raktas — normalizuotas pavadinimo fragmentas (be diakritikos, mažosios) */
export const LT_PLACES: Record<string, PlaceInfo> = {
  vilniaus: { city: "Vilnius", lat: 54.6872, lng: 25.2797, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  vilniuje: { city: "Vilnius", lat: 54.6872, lng: 25.2797, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  kauno: { city: "Kaunas", lat: 54.8985, lng: 23.9036, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  kaune: { city: "Kaunas", lat: 54.8985, lng: 23.9036, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  domeikavos: { city: "Domeikava", lat: 54.964, lng: 23.908, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  jonavos: { city: "Jonava", lat: 55.072, lng: 24.278, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  josvainiu: { city: "Josvainiai", lat: 55.083, lng: 23.833, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  jurbarko: { city: "Jurbarkas", lat: 55.078, lng: 22.764, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  karmelavos: { city: "Karmėlava", lat: 54.972, lng: 24.062, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  kedainiu: { city: "Kėdainiai", lat: 55.288, lng: 23.974, deaneryId: "sen-kedainiai", deaneryName: "Kėdainių seniūnija" },
  lapiu: { city: "Lapės", lat: 54.969, lng: 23.908, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  pernaravos: { city: "Pernarava", lat: 55.142, lng: 23.85, deaneryId: "sen-kedainiai", deaneryName: "Kėdainių seniūnija" },
  raudondvario: { city: "Raudondvaris", lat: 54.938, lng: 23.783, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  raseiniu: { city: "Raseiniai", lat: 55.379, lng: 23.124, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  siluvos: { city: "Šiluva", lat: 55.489, lng: 23.224, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  ukmerges: { city: "Ukmergė", lat: 55.250, lng: 24.749, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  jiezno: { city: "Jieznas", lat: 54.583, lng: 24.167, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  kaisiadoriu: { city: "Kaišiadorys", lat: 54.866, lng: 24.456, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  merkines: { city: "Merkinė", lat: 54.16, lng: 24.19, deaneryId: "sen-alytus", deaneryName: "Alytaus seniūnija" },
  moletu: { city: "Molėtai", lat: 55.234, lng: 25.418, deaneryId: "sen-utena-molėtai", deaneryName: "Utenos–Molėtų seniūnija" },
  pivasiskiu: { city: "Pivašiūnai", lat: 54.45, lng: 24.35, deaneryId: "sen-alytus", deaneryName: "Alytaus seniūnija" },
  pivasiunu: { city: "Pivašiūnai", lat: 54.45, lng: 24.35, deaneryId: "sen-alytus", deaneryName: "Alytaus seniūnija" },
  sirvintu: { city: "Širvintos", lat: 55.044, lng: 24.954, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  vievio: { city: "Vievis", lat: 54.766, lng: 24.811, deaneryId: "sen-trakai", deaneryName: "Trakų seniūnija" },
  panevezio: { city: "Panevėžys", lat: 55.7348, lng: 24.3575, deaneryId: "sen-panevezys", deaneryName: "Panevėžio seniūnija" },
  anyksciu: { city: "Anykščiai", lat: 55.525, lng: 25.102, deaneryId: "sen-birzai-rokuiskis", deaneryName: "Biržų–Rokiškio seniūnija" },
  birzu: { city: "Biržai", lat: 56.201, lng: 24.756, deaneryId: "sen-birzai-rokuiskis", deaneryName: "Biržų–Rokiškio seniūnija" },
  krekenavos: { city: "Krekenava", lat: 55.547, lng: 24.099, deaneryId: "sen-panevezys", deaneryName: "Panevėžio seniūnija" },
  leliunu: { city: "Leliūnai", lat: 55.7, lng: 24.35, deaneryId: "sen-panevezys", deaneryName: "Panevėžio seniūnija" },
  rokiskio: { city: "Rokiškis", lat: 55.955, lng: 25.585, deaneryId: "sen-birzai-rokuiskis", deaneryName: "Biržų–Rokiškio seniūnija" },
  svedasu: { city: "Svedasai", lat: 55.783, lng: 25.35, deaneryId: "sen-birzai-rokuiskis", deaneryName: "Biržų–Rokiškio seniūnija" },
  utenos: { city: "Utena", lat: 55.497, lng: 25.599, deaneryId: "sen-utena-molėtai", deaneryName: "Utenos–Molėtų seniūnija" },
  zarasu: { city: "Zarasai", lat: 55.731, lng: 26.249, deaneryId: "sen-utena-molėtai", deaneryName: "Utenos–Molėtų seniūnija" },
  siauliu: { city: "Šiauliai", lat: 55.9349, lng: 23.3137, deaneryId: "sen-siauliai", deaneryName: "Šiaulių seniūnija" },
  pakruojo: { city: "Pakruojis", lat: 55.978, lng: 23.855, deaneryId: "sen-siauliai", deaneryName: "Šiaulių seniūnija" },
  tytuvenu: { city: "Tytuvėnai", lat: 55.598, lng: 23.2, deaneryId: "sen-siauliai", deaneryName: "Šiaulių seniūnija" },
  telsiu: { city: "Telšiai", lat: 55.981, lng: 22.248, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  klaipedos: { city: "Klaipėda", lat: 55.703, lng: 21.144, deaneryId: "sen-klaipeda", deaneryName: "Klaipėdos seniūnija" },
  kretingos: { city: "Kretinga", lat: 55.889, lng: 21.244, deaneryId: "sen-klaipedos-krastas", deaneryName: "Klaipėdos krašto seniūnija" },
  pakutuvenu: { city: "Pakutuvėnai", lat: 55.95, lng: 21.95, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  palangos: { city: "Palanga", lat: 55.917, lng: 21.068, deaneryId: "sen-klaipeda", deaneryName: "Klaipėdos seniūnija" },
  plunges: { city: "Plungė", lat: 55.911, lng: 21.845, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  sventosios: { city: "Šventoji", lat: 56.025, lng: 21.075, deaneryId: "sen-klaipeda", deaneryName: "Klaipėdos seniūnija" },
  zemaiciu: { city: "Žemaičių Kalvarija", lat: 56.115, lng: 22.017, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  kalvarijos: { city: "Žemaičių Kalvarija", lat: 56.115, lng: 22.017, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  alytaus: { city: "Alytus", lat: 54.396, lng: 24.045, deaneryId: "sen-alytus", deaneryName: "Alytaus seniūnija" },
  bagotosios: { city: "Bagotoji", lat: 54.55, lng: 23.0, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  griskabudzio: { city: "Griškabūdis", lat: 54.85, lng: 23.0, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  igliaukos: { city: "Igliauka", lat: 54.55, lng: 23.3, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  islauzo: { city: "Išlaužas", lat: 54.65, lng: 23.55, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  marijampoles: { city: "Marijampolė", lat: 54.559, lng: 23.354, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  pakuonio: { city: "Pakuonis", lat: 54.6, lng: 24.0, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  prienu: { city: "Prienai", lat: 54.634, lng: 23.941, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  sestoku: { city: "Šeštokai", lat: 54.35, lng: 23.4, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  ignalinos: { city: "Ignalina", lat: 55.340, lng: 26.173, deaneryId: "sen-utena-molėtai", deaneryName: "Utenos–Molėtų seniūnija" },
  kalesninku: { city: "Kalesninkai", lat: 54.75, lng: 24.95, deaneryId: "sen-alytus", deaneryName: "Alytaus seniūnija" },
  pabrades: { city: "Pabradė", lat: 54.98, lng: 25.75, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  paluses: { city: "Palūšė", lat: 55.32, lng: 26.12, deaneryId: "sen-utena-molėtai", deaneryName: "Utenos–Molėtų seniūnija" },
  svencioniu: { city: "Švenčionys", lat: 55.133, lng: 26.159, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  tvereciaus: { city: "Tverečius", lat: 55.3, lng: 26.6, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  vu: { city: "Vilnius", lat: 54.6872, lng: 25.2797, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
  sakramento: { city: "Kaunas", lat: 54.8985, lng: 23.9036, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
};

const DIOCESE_DEFAULT: Record<string, PlaceInfo> = {
  "kauno arkivyskupija": { city: "Kaunas", lat: 54.8985, lng: 23.9036, deaneryId: "sen-kaunas", deaneryName: "Kauno miesto seniūnija" },
  "kaišiadorių vyskupija": { city: "Kaišiadorys", lat: 54.866, lng: 24.456, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  "panevėžio vyskupija": { city: "Panevėžys", lat: 55.7348, lng: 24.3575, deaneryId: "sen-panevezys", deaneryName: "Panevėžio seniūnija" },
  "šiaulių vyskupija": { city: "Šiauliai", lat: 55.9349, lng: 23.3137, deaneryId: "sen-siauliai", deaneryName: "Šiaulių seniūnija" },
  "telšių vyskupija": { city: "Telšiai", lat: 55.981, lng: 22.248, deaneryId: "sen-telsiai", deaneryName: "Telšių seniūnija" },
  "vilkaviškio vyskupija": { city: "Marijampolė", lat: 54.559, lng: 23.354, deaneryId: "sen-marijampole", deaneryName: "Marijampolės seniūnija" },
  "vilniaus arkivyskupija": { city: "Vilnius", lat: 54.6872, lng: 25.2797, deaneryId: "sen-vilnius", deaneryName: "Vilniaus miesto seniūnija" },
};

export function normalizeLt(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function dioceseFromHeader(raw: string): string {
  const n = normalizeLt(raw);
  if (n.includes("kauno") && n.includes("arkiv")) return "Kauno arkivyskupija";
  if (n.includes("kaisiador")) return "Kaišiadorių vyskupija";
  if (n.includes("panevez")) return "Panevėžio vyskupija";
  if (n.includes("siaul")) return "Šiaulių vyskupija";
  if (n.includes("telsi")) return "Telšių vyskupija";
  if (n.includes("vilkavisk")) return "Vilkaviškio vyskupija";
  if (n.includes("vilniaus") && n.includes("arkiv")) return "Vilniaus arkivyskupija";
  return raw.trim();
}

export function resolvePlace(title: string, diocese: string): PlaceInfo {
  const norm = normalizeLt(title);
  const keys = Object.keys(LT_PLACES).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (norm.startsWith(key) || norm.includes(` ${key} `) || norm.includes(`${key} `)) {
      return LT_PLACES[key]!;
    }
  }
  const first = norm.split(/\s+/)[0] ?? "";
  if (first && LT_PLACES[first]) return LT_PLACES[first]!;
  const fallback = DIOCESE_DEFAULT[normalizeLt(diocese)];
  if (fallback) return fallback;
  return {
    city: "Lietuva",
    lat: 55.17,
    lng: 23.88,
    deaneryId: "sen-vilnius",
    deaneryName: "Lietuva",
  };
}
