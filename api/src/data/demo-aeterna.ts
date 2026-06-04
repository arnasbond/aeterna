import type { AeternaMemorial } from "../types/aeterna.js";
import { DEMO_PARISH_ID } from "./lt-parishes.js";

export { LT_PARISHES as DEMO_PARISHES } from "./lt-parishes.js";

/** Viešas web CDN demo nuotraukoms (statiniai failai web/public/demo/stase). */
export const DEMO_STASE_MEDIA_BASE =
  (process.env.PUBLIC_WEB_URL || "https://aeterna-mauve.vercel.app").replace(/\/$/, "") +
  "/demo/stase";

/** Demo profilio turinys — /m/ona-demo (šilta močiutė) */
export const DEMO_AETERNA_MEMORIAL: Omit<
  AeternaMemorial,
  "id" | "slug" | "profileUrl" | "qrCodeUrl" | "createdAt" | "updatedAt"
> = {
  userId: null,
  parishId: DEMO_PARISH_ID,
  fullName: "Stasė",
  birthDate: "1936-05-12",
  deathDate: "2024-12-24",
  portraitUrl: `${DEMO_STASE_MEDIA_BASE}/portrait.jpg`,
  farewellMessage:
    "Mano saldžiausieji vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: aš vis dar sėdžiu su jumis prie arbatos stalo, tik jau tyliau. Būkite švelnūs vieni kitam, dalinkitės maistu ir juokais — tai mano mėgstamiausios dovanos. Nepamirškite pasakyti „ačiū“ už mažas akimirkas ir apkabinti tada, kai dar galite. Aš jus myliu labiau, nei žodžiai telpa.",
  biography:
    "Stasė — visi ją vadino tiesiog Močiute. Gimė 1936 m. gegužę, užaugino keturis vaikus ir džiaugėsi dvylika anūkų. Jos virtuvėje visada kvepėjo cinamonu — obuolių pyragas buvo šeimos sekmadienio ritualas. Stasė mokėjo išklausyti be skubėjimo, siūti sagą ant megztinio ir paslėpti saldainį kišenėje „tik tam, kas buvo geras“.\n\nJi mėgo sodą, senas dainas ir rankas, kurios niekada nebuvo tuščios — ar apkabinti, ar paduoti arbatinuką. Paskutiniais metais dažnai sakydavo: „Geriausia dovana — laikas kartu ir šiltas žodis.“ Jos šypsena liko namuose, kai ji pati jau išėjo ramiai, Kūčių išvakarėse.",
  mediaGallery: [
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-1-kitchen.jpg`,
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-2-tea.jpg`,
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-3-garden.jpg`,
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-4-family.jpg`,
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-5-knitting.jpg`,
    `${DEMO_STASE_MEDIA_BASE}/stase-gallery-6-candle.jpg`,
  ],
  videoUrl: "https://www.youtube.com/watch?v=hlWiI4xVXKY",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
  moderationStatus: "approved",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";
export const DEMO_VARDENIS_SLUG = "vardenis-pavardenis";

/** Antras demo profilis paieškai (raidė V). */
export const DEMO_VARDENIS_MEMORIAL: Omit<
  AeternaMemorial,
  "id" | "slug" | "profileUrl" | "qrCodeUrl" | "createdAt" | "updatedAt"
> = {
  userId: null,
  parishId: DEMO_PARISH_ID,
  fullName: "Vardenis Pavardenis",
  birthDate: "1940-01-15",
  deathDate: "2020-06-01",
  portraitUrl: null,
  farewellMessage: "Amžinąją šviesą tegu mato artimieji.",
  biography:
    "Vardenis Pavardenis — ramus žmogus, mylėjęs šeimą ir parapijos bendruomenę. Demo profilis paieškai ir navigacijai iki kapo.",
  mediaGallery: [],
  videoUrl: null,
  geoLocation: { lat: 54.6912, lng: 25.2848 },
  privacyStatus: "public",
  moderationStatus: "approved",
};

/** Padidinkite, kai keičiate demo turinį — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 11;
