import type { MemorialPublic } from "@/lib/api";

const DEMO_PARISH = {
  id: "parish-vilniaus-sv-stanislovo-ir-sv-vladislovo-arkikatedra-bazilika",
  title: "Vilniaus Šv. Stanislovo ir šv. Vladislapo arkikatedra bazilika",
  diocese: "Vilniaus arkivyskupija",
  supportGoal: "Parama parapijos veiklai ir socialinei pagalbai",
  image: "https://images.unsplash.com/photo-1477617722074-45613a51bf6d?auto=format&fit=crop&q=80&w=800",
};

const MEDIA_BASE = "https://aeterna-mauve.vercel.app/demo/stase";

const DEMOS: Record<string, MemorialPublic> = {
  "ona-demo": {
    id: "demo-ona",
    slug: "ona-demo",
    parishId: DEMO_PARISH.id,
    fullName: "Stasė",
    birthDate: "1936-05-12",
    deathDate: "2024-12-24",
    biography:
      "Stasė — visi ją vadino tiesiog Močiute. Gimė 1936 m. gegužę, užaugino keturis vaikus ir džiaugėsi dvylika anūkų. Jos virtuvėje visada kvepėjo cinamonu — obuolių pyragas buvo šeimos sekmadienio ritualas. Stasė mokėjo išklausyti be skubėjimo, siūti sagą ant megztinio ir paslėpti saldainį kišenėje „tik tam, kas buvo geras“.\n\nJi mėgo sodą, senas dainas ir rankas, kurios niekada nebuvo tuščios — ar apkabinti, ar paduoti arbatinuką. Paskutiniais metais dažnai sakydavo: „Geriausia dovana — laikas kartu ir šiltas žodis.“ Jos šypsena liko namuose, kai ji pati jau išėjo ramiai, Kūčių išvakarėse.",
    isPremium: false,
    portraitUrl: `${MEDIA_BASE}/portrait.jpg`,
    farewellMessage:
      "Mano saldžiausieji vaikai ir anūkai — būkite švelnūs vieni kitam, dalinkitės maistu ir juokais. Aš jus myliu labiau, nei žodžiai telpa.",
    mediaGallery: [
      `${MEDIA_BASE}/stase-gallery-1-kitchen.jpg`,
      `${MEDIA_BASE}/stase-gallery-2-tea.jpg`,
      `${MEDIA_BASE}/stase-gallery-3-garden.jpg`,
      `${MEDIA_BASE}/stase-gallery-4-family.jpg`,
      `${MEDIA_BASE}/stase-gallery-5-knitting.jpg`,
      `${MEDIA_BASE}/stase-gallery-6-candle.jpg`,
    ],
    videoUrl: "https://www.youtube.com/watch?v=hlWiI4xVXKY",
    geoLocation: { lat: 54.6866, lng: 25.2872 },
    privacyStatus: "public",
    qrCodeUrl: null,
    profileUrl: "https://aeterna-mauve.vercel.app/m/ona-demo",
    linkedToAccount: false,
    parish: DEMO_PARISH,
  },
  "vardenis-pavardenis": {
    id: "demo-vardenis",
    slug: "vardenis-pavardenis",
    parishId: DEMO_PARISH.id,
    fullName: "Vardenis Pavardenis",
    birthDate: "1940-01-15",
    deathDate: "2020-06-01",
    biography:
      "Vardenis Pavardenis — ramus žmogus, mylėjęs šeimą ir parapijos bendruomenę. Demo profilis paieškai ir navigacijai iki kapo.",
    isPremium: false,
    portraitUrl: null,
    farewellMessage: "Amžinąją šviesą tegu mato artimieji.",
    mediaGallery: [],
    videoUrl: null,
    geoLocation: { lat: 54.6912, lng: 25.2848 },
    privacyStatus: "public",
    qrCodeUrl: null,
    profileUrl: "https://aeterna-mauve.vercel.app/m/vardenis-pavardenis",
    linkedToAccount: false,
    parish: DEMO_PARISH,
  },
};

export function getDemoMemorialPublic(slug: string): MemorialPublic | null {
  return DEMOS[slug] ?? null;
}

export function isDemoMemorialSlug(slug: string): boolean {
  return slug in DEMOS;
}
