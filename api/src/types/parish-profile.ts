/** Papildoma parapijos profilio informacija (redaguoja klebonas) */
export type ParishProfile = {
  parishId: string;
  shortDescription: string;
  about: string;
  address: string;
  phone: string;
  email: string;
  priestName: string;
  deputyPriestName: string;
  massSchedule: string;
  confessionTimes: string;
  officeHours: string;
  sacraments: string;
  announcements: string;
  bankDetails: string;
  galleryUrls: string[];
  extraSections: ParishProfileSection[];
  importedFrom: string | null;
  importedAt: string | null;
  updatedAt: string;
};

export type ParishProfileSection = {
  title: string;
  body: string;
};

export type ParishProfileInput = Partial<
  Omit<ParishProfile, "parishId" | "importedFrom" | "importedAt" | "updatedAt">
>;

export type ParishWithProfile = {
  profile: ParishProfile;
};
