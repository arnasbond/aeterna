export type UserAccount = {
  id: string;
  email: string;
  fullName: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type UserPublic = Pick<UserAccount, "id" | "email" | "fullName" | "createdAt">;

export type UserRegisterInput = {
  fullName: string;
  email: string;
  password: string;
  passwordConfirm?: string;
};

export type UserLoginInput = {
  email: string;
  password: string;
};

import type { FamilyTreeNode } from "./aeterna.js";

export type UpdateMemorialInput = {
  fullName?: string;
  birthDate?: string | null;
  deathDate?: string | null;
  biography?: string;
  farewellMessage?: string | null;
  videoUrl?: string | null;
  portraitUrl?: string | null;
  mediaGallery?: string[];
  privacyStatus?: "public" | "private";
  parishId?: string;
  familyTree?: FamilyTreeNode[];
  anniversaryRemindersEnabled?: boolean;
};
