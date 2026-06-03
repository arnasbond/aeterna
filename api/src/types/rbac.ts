/** AETERNA RBAC — trys vaidmenys */

export type UserRole = "super_admin" | "parish_admin" | "family_admin";

export type SuperAdminCapabilities = {
  manageParishes: true;
  setParishBankDetails: true;
  approveMemorials: true;
  viewPlatformVolume: true;
};

export type ParishAdminCapabilities = {
  manageMassSlots: true;
  viewIntentionsFeed: true;
  viewParishFinances: true;
};

export type FamilyAdminCapabilities = {
  editMemorialBiography: true;
  uploadMemorialMedia: true;
  moderateCondolences: true;
};

export type AuthPrincipal = {
  role: UserRole;
  userId: string;
  email: string;
  parishId?: string;
  memorialSlugs?: string[];
};
