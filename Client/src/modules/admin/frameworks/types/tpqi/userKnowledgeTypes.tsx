export enum KnowledgeApprovalStatus {
  APPROVED = "APPROVED",
  NOT_APPROVED = "NOT_APPROVED",
}

export interface UserKnowledge {
    id: number;
    knowledgeId: number;
    userId: number;
    evidenceUrl: string | null;
    approvalStatus: KnowledgeApprovalStatus
}

export interface UserKnowledgePageResult {
    data: UserKnowledge[];
    total?: number;
}

export type UpdateUserKnowledgeDto = Omit<UserKnowledge, "id">