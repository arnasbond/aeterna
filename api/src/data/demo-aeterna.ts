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
    "https://images.unsplash.com/photo-1758686253896-e6c76b6f7aa1?w=900&q=85",
  farewellMessage:
    "Mano saldžiausieji vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: aš vis dar sėdžiu su jumis prie arbatos stalo, tik jau tyliau. Būkite švelnūs vieni kitam, dalinkitės maistu ir juokais — tai mano mėgstamiausios dovanos. Nepamirškite pasakyti „ačiū“ už mažas akimirkas ir apkabinti tada, kai dar galite. Aš jus myliu labiau, nei žodžiai telpa.",
  biography:
    "Stasė — visi ją vadino tiesiog Močiute. Gimė 1936 m. gegužę, užaugino keturis vaikus ir džiaugėsi dvylika anūkų. Jos virtuvėje visada kvepėjo cinamonu — obuolių pyragas buvo šeimos sekmadienio ritualas. Stasė mokėjo išklausyti be skubėjimo, siūti sagą ant megztinio ir paslėpti saldainį kišenėje „tik tam, kas buvo geras“.\n\nJi mėgo sodą, senas dainas ir rankas, kurios niekada nebuvo tuščios — ar apkabinti, ar paduoti arbatinuką. Paskutiniais metais dažnai sakydavo: „Geriausia dovana — laikas kartu ir šiltas žodis.“ Jos šypsena liko namuose, kai ji pati jau išėjo ramiai, Kūčių išvakarėse.",
  mediaGallery: [
    "https://images.unsplash.com/photo-1758686254563-5c5ab338c8b9?w=900&q=85",
    "https://images.unsplash.com/photo-1616286608358-0e1b143f7d2f?w=900&q=85",
    "https://images.unsplash.com/photo-1695556746353-b45f7a329777?w=900&q=85",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=85",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&q=85",
    "https://images.pexels.com/photos/3823497/pexels-photo-3823497.jpeg?auto=compress&cs=tinysrgb&w=900",
  ],
  videoUrl: "https://assets.mixkit.co/videos/5383/5383-720.mp4",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
  moderationStatus: "approved",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";

/** Padidinkite, kai keičiate demo turinį — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 5;
