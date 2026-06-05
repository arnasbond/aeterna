export type Parish = {
  id: string;
  title: string;
  diocese: string;
  deaneryId: string;
  deaneryName: string;
  lat: number;
  lng: number;
  city?: string;
  image: string;
  bankAccount: string;
  supportGoal: string;
  /** Oficiali parapijos svetainė (iš katalikai.lt sąrašo) */
  websiteUrl?: string;
  source?: string;
  sourceUrl?: string;
  updatedAt?: string;
  /** Registrų centro JAR juridinio asmens kodas */
  jarCode?: string;
  /** Registracijos adresas iš RC */
  address?: string;
};

export type DeaneryFeatureProperties = {
  id: string;
  name: string;
  diocese: string;
};

export type MapData = {
  deaneries: {
    type: "FeatureCollection";
    features: Array<{
      type: "Feature";
      properties: DeaneryFeatureProperties;
      geometry: { type: "Polygon"; coordinates: number[][][] };
    }>;
  };
  parishes: ParishMapPoint[];
};

export type ParishMapPoint = Pick<
  Parish,
  "id" | "title" | "diocese" | "deaneryId" | "deaneryName" | "lat" | "lng" | "city"
>;

export type GeoLocation = { lat: number; lng: number };

export type FamilyTreeNode = {
  id: string;
  name: string;
  relation: string;
  birthDate?: string | null;
  deathDate?: string | null;
  note?: string | null;
};

export type AeternaMemorial = {
  id: string;
  slug: string;
  userId: string | null;
  parishId: string;
  fullName: string;
  birthDate: string | null;
  deathDate: string | null;
  biography: string;
  /** Premium narystės funkcijų išjungimas/įjungimas */
  isPremium: boolean;
  /** Premium — giminės medžio įrašai */
  familyTree?: FamilyTreeNode[];
  /** Premium — el. pašto priminimai prieš mirties metines */
  anniversaryRemindersEnabled?: boolean;
  /** Pagrindinė portreto nuotrauka (hero) */
  portraitUrl?: string | null;
  /** Palinkėjimas / žinutė palikuonims */
  farewellMessage?: string | null;
  mediaGallery: string[];
  videoUrl: string | null;
  geoLocation: GeoLocation | null;
  privacyStatus: "public" | "private";
  /** Super admin patvirtinimas — seni profiliai be lauko laikomi approved */
  moderationStatus?: "pending" | "approved" | "rejected";
  qrCodeUrl: string | null;
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type AeternaMemorialPublic = Omit<AeternaMemorial, "userId"> & {
  parish: Pick<Parish, "id" | "title" | "diocese" | "supportGoal" | "image">;
  /** Ar profilis pririštas prie vartotojo paskyros (redaguoti gali tik savininkas) */
  linkedToAccount: boolean;
};

export type CreateMemorialInput = {
  parishId: string;
  fullName: string;
  birthDate?: string;
  deathDate?: string;
  biography?: string;
  /** Premium feature flag (default: false) */
  isPremium?: boolean;
  portraitUrl?: string;
  mediaGallery?: string[];
  videoUrl?: string;
  privacyStatus?: "public" | "private";
};

export type CheckoutInput = {
  memorialSlug?: string;
  parishId: string;
  planId?: string;
  amountCents?: number;
};

export type MassSchedule = {
  id: string;
  parishId: string;
  dateTime: string;
  isAvailable: boolean;
  intentions: string | null;
  bookedBy: string | null;
  status: "open" | "pending" | "confirmed";
  donationAmountCents: number | null;
  createdAt: string;
};

export type MassBookingInput = {
  massId: string;
  intentions: string;
  donorName: string;
  amountCents?: number;
};

export type VirtualCandle = {
  id: string;
  memorialId: string;
  memorialSlug: string;
  parishId: string;
  donorName: string;
  litAt: string;
  donationAmountCents: number;
};

export type FindMemorialInput = {
  fullName: string;
  birthDate: string;
  deathDate: string;
};

export type LightCandleInput = {
  memorialSlug: string;
  donorName: string;
  amountCents: number;
};

export type PriestLoginInput = {
  parishId: string;
  password: string;
};

export type PriestAccessRequestInput = {
  parishId: string;
  priestName: string;
  email: string;
  phone?: string;
  note?: string;
};

export type PriestAccessRequest = {
  id: string;
  parishId: string;
  parishTitle: string;
  priestName: string;
  email: string;
  phone: string | null;
  note: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
};

export type PriestAccessApproval = {
  requestId: string;
  parishId: string;
  temporaryPassword: string;
  expiresAt: string;
};

export type PriestDashboard = {
  parish: Parish;
  finances: {
    candlesTotalCents: number;
    massesTotalCents: number;
    memorialsTotalCents: number;
    totalCents: number;
  };
  pendingMasses: number;
  upcomingSlots: number;
};

export type ParishSummary = {
  parishId: string;
  title: string;
  totalOrders: number;
  totalAmountCents: number;
  parishCommissionCents: number;
};
