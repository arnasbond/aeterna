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
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=85",
  farewellMessage:
    "Mylimieji mano vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: mano širdis liko su jumis. Nepykite vieni ant kitų, melskitės už tuos, kurių nebėra šalia, ir neškit dovaną tiems, kuriems šiandien sunku. Aš mačiau jūsų šypsenas tūkstančius kartų — jos man buvo didžiausias dangaus langas. Myliu jus amžinai.",
  biography:
    "Ona Kazlauskienė gimė 1942 m. kovo 15 d. Raseinių rajone. Visą gyvenimą kūrė namus su Juozu — kartu užaugino tris vaikus ir džiaugėsi aštuoniais anūkais. Mėgo giedoti parapijos chore, kepti duoną pagal močiutės receptą ir priimti svečius su arbata bei šypsena.\n\nPaskutiniais metais Ona rašė atsiminimus ir sakydavo: „Geriausia dovana — laikas kartu.“ Jos rankos visada buvo pasiruošusios apkabinti, o žodžiai — paguosti.",
  mediaGallery: [
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=85",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=85",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85",
  ],
  /** Patikimas MP4 (Mixkit nuoroda nebeveikia). */
  videoUrl: "https://download.samplelib.com/mp4/sample-15s.mp4",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";

/** Padidinkite, kai keičiate demo mediaGallery / videoUrl — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 2;
