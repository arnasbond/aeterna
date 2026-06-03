/** Kliento RBAC — atitinka API scaffold */

export type UserRole = "super_admin" | "parish_admin" | "family_admin";

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Platformos savininkas",
  parish_admin: "Parapijos administratorius",
  family_admin: "Šeimos administratorius",
};
