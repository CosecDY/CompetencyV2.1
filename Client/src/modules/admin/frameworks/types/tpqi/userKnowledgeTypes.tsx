export enum KnowledgeApprovalStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
}

export interface UserKnowledge {
  id: number;
  knowledgeId: number;
  userId: number;
  evidenceUrl: string | null;
  approvalStatus: KnowledgeApprovalStatus;
}

export interface UserKnowledgePageResult {
  data: UserKnowledge[];
  total?: number;
}

export type UpdateUserKnowledgeDto = Omit<UserKnowledge, "id">;
