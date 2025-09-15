// ---- enums stay the same ----
export enum InformationApprovalStatus {
  APPROVED = "APPROVED",
  NOT_APPROVED = "NOT_APPROVED",
}

export interface InformationUser {
  id?: string;
  email?: string | null;
}

export interface InformationDataCollection {
  id: number;
  userId: string;
  user?: InformationUser | null;
}

export interface Information {
  id: number;
  subSkillId?: number | null;
  dataCollectionId?: number | null;
  createdAt: string;
  evidenceUrl?: string | null;
  approvalStatus: InformationApprovalStatus | null;
  dataCollection?: InformationDataCollection | null;
}

export interface InformationPageResult {
  data: Information[];
  total?: number;
}

export type UpdateInformationDto = Omit<Information, "id">;
