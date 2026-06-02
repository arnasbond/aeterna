export type SupportCategory = "problem" | "fix" | "request" | "other";
export type SupportStatus = "open" | "in_progress" | "resolved";
export type SupportAuthorRole = "priest" | "admin";

export type SupportThread = {
  id: string;
  parishId: string;
  parishTitle: string;
  subject: string;
  category: SupportCategory;
  status: SupportStatus;
  createdAt: string;
  updatedAt: string;
  priestUnread: number;
  adminUnread: number;
};

export type SupportMessage = {
  id: string;
  threadId: string;
  authorRole: SupportAuthorRole;
  authorLabel: string;
  body: string;
  createdAt: string;
};

export type CreateSupportThreadInput = {
  subject: string;
  category: SupportCategory;
  body: string;
};

export type PostSupportMessageInput = {
  body: string;
};

export type UpdateSupportThreadInput = {
  status?: SupportStatus;
};
