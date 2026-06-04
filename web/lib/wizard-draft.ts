const KEY = "aeterna_wizard_draft_v1";

export type WizardDraft = {
  fullName: string;
  birthDate: string;
  deathDate: string;
  biography: string;
  portraitUrl: string;
  galleryUrls: string[];
  videoUrl: string;
  parishId: string;
  step: number;
  maxStep: number;
};

export function loadWizardDraft(): WizardDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WizardDraft;
  } catch {
    return null;
  }
}

export function saveWizardDraft(draft: WizardDraft) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    /* quota */
  }
}

export function clearWizardDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
