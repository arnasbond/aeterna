export type MassSlotRequestSource = "home" | "parish_hub" | "memorial";

export type MassSlotRequestStatus = "pending" | "acknowledged";

export type MassSlotRequest = {
  id: string;
  parishId: string;
  requesterName: string;
  message: string;
  source: MassSlotRequestSource;
  status: MassSlotRequestStatus;
  createdAt: string;
  acknowledgedAt: string | null;
};

export type CreateMassSlotRequestInput = {
  parishId: string;
  requesterName?: string;
  message?: string;
  source?: MassSlotRequestSource;
};
