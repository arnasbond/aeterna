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
  fullName: "Stasė Ramonienė",
  birthDate: "1936-05-12",
  deathDate: "2024-12-24",
  portraitUrl:
    "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=900&q=85",
  farewellMessage:
    "Mano saldžiausieji vaikai ir anūkai — jei skaitote šiuos žodžius, žinokite: aš vis dar sėdžiu su jumis prie arbatos stalo, tik jau tyliau. Būkite švelnūs vieni kitam, dalinkitės maistu ir juokais — tai mano mėgstamiausios dovanos. Nepamirškite pasakyti „ačiū“ už mažas akimirkas ir apkabinti tada, kai dar galite. Aš jus myliu labiau, nei žodžiai telpa.",
  biography:
    "Stasė Ramonienė — visi ją vadino tiesiog Močiute. Gimė 1936 m. gegužę, užaugino keturis vaikus ir džiaugėsi dvylika anūkų. Jos virtuvėje visada kvepėjo cinamonu — obuolių pyragas buvo šeimos sekmadienio ritualas. Stasė mokėjo išklausyti be skubėjimo, siūti sagą ant megztinio ir paslėpti saldainį kišenėje „tik tam, kas buvo geras“.\n\nJi mėgo sodą, senas dainas ir rankas, kurios niekada nebuvo tuščios — ar apkabinti, ar paduoti arbatinuką. Paskutiniais metais dažnai sakydavo: „Geriausia dovana — laikas kartu ir šiltas žodis.“ Jos šypsena liko namuose, kai ji pati jau išėjo ramiai, Kūčių išvakarėse.",
  mediaGallery: [
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&q=85",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85",
    "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=900&q=85",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=85",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=900&q=85",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=900&q=85",
  ],
  videoUrl: "https://download.samplelib.com/mp4/sample-15s.mp4",
  geoLocation: { lat: 54.6866, lng: 25.2872 },
  privacyStatus: "public",
};

export const DEMO_MEMORIAL_SLUG = "ona-demo";

/** Padidinkite, kai keičiate demo turinį — priverstinis atnaujinimas serveryje. */
export const DEMO_MEDIA_VERSION = 3;
