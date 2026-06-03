export type GuestbookEntryStatus = "pending" | "approved" | "rejected";

export type GuestbookEntry = {
  id: string;
  memorialSlug: string;
  authorName: string;
  message: string;
  status: GuestbookEntryStatus;
  createdAt: string;
  reviewedAt: string | null;
};

export type CreateGuestbookInput = {
  authorName: string;
  message: string;
};
