import type { AeternaMemorial } from "../types/aeterna.js";
import { DEMO_PARISH_ID } from "./lt-parishes.js";

export { LT_PARISHES as DEMO_PARISHES } from "./lt-parishes.js";

/** Demo profilio turinys — /m/ona-demo */
export const DEMO_AETERNA_MEMORIAL: Omit<
  AeternaMemorial,
  "id" | "slug" | "profileUrl" | "qrCodeUrl" | "createdAt" | "updatedAt"
> = {
  userId: null,
  parishId: DEMO_PARISH_ID,
  fullName: "Ona Kazlauskienė",
  birthDate: "1942-03-15",
  deathDate: "2024-11-02",
  portraitUrl:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=85",
  farewellMessage:
    "Mylimieji mano vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: mano širdis liko su jumis. Nepykite vieni ant kitų, melskitės už tuos, kurių nebėra šalia, ir neškit dovaną tiems, kuriems šiandien sunku. Aš mačiau jūsų šypsenas tūkstančius kartų — jos man buvo didžiausias dangaus langas. Myliu jus amžinai.",
  biography:
    "Ona Kazlauskienė gimė 1942 m. kovo 15 d. Raseinių rajone. Visą gyvenimą kūrė namus su Juozu — kartu užaugino tris vaikus ir džiaugėsi aštuoniais anūkais. Mėgo giedoti parapijos chore, kepti duoną pagal močiutės receptą ir priimti svečius su arbata bei šypsena.\n\nPaskutiniais metais Ona rašė atsiminimus ir sakydavo: „Geriausia dovana — laikas kartu.“ Jos rankos visada buvo pasiruošusios apkabinti, o žodžiai — paguosti.",
  mediaGallery: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1490750967868-88d498d6a715?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1518895949257-8f162f49e7b5?auto=format&fit=crop&w=900&q=85",
    "https://images.unsplash.com/photo-1609223503685-d7e2b1d90e73?auto=format&fit=crop&w=900&q=85",
  ],
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-candle-flame-burning-close-up-945-large.mp4",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";
