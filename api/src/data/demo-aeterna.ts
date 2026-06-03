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
    "https://images.unsplash.com/photo-1517089591107-248f8923a784?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1518391846015-55a9cb030ad7?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?auto=format&fit=crop&q=80&w=400",
    "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=400",
  ],
  videoUrl: "https://assets.mixkit.co/videos/3042/3042-720.mp4",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
  moderationStatus: "approved",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";

/** Padidinkite, kai keičiate demo turinį — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 8;
