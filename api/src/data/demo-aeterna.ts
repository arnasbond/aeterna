import type { AeternaMemorial } from "../types/aeterna.js";
import { DEMO_PARISH_ID } from "./lt-parishes.js";

export { LT_PARISHES as DEMO_PARISHES } from "./lt-parishes.js";

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
  portraitUrl:
    "https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?auto=format&fit=crop&q=80&w=600",
  farewellMessage:
    "Mano saldžiausieji vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: aš vis dar sėdžiu su jumis prie arbatos stalo, tik jau tyliau. Būkite švelnūs vieni kitam, dalinkitės maistu ir juokais — tai mano mėgstamiausios dovanos. Nepamirškite pasakyti „ačiū“ už mažas akimirkas ir apkabinti tada, kai dar galite. Aš jus myliu labiau, nei žodžiai telpa.",
  biography:
    "Stasė — visi ją vadino tiesiog Močiute. Gimė 1936 m. gegužę, užaugino keturis vaikus ir džiaugėsi dvylika anūkų. Jos virtuvėje visada kvepėjo cinamonu — obuolių pyragas buvo šeimos sekmadienio ritualas. Stasė mokėjo išklausyti be skubėjimo, siūti sagą ant megztinio ir paslėpti saldainį kišenėje „tik tam, kas buvo geras“.\n\nJi mėgo sodą, senas dainas ir rankas, kurios niekada nebuvo tuščios — ar apkabinti, ar paduoti arbatinuką. Paskutiniais metais dažnai sakydavo: „Geriausia dovana — laikas kartu ir šiltas žodis.“ Jos šypsena liko namuose, kai ji pati jau išėjo ramiai, Kūčių išvakarėse.",
  mediaGallery: [
    "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&q=80&w=400",
  ],
  videoUrl: "https://www.youtube.com/watch?v=hlWiI4xVXKY",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
  moderationStatus: "approved",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";

/** Padidinkite, kai keičiate demo turinį — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 9;
