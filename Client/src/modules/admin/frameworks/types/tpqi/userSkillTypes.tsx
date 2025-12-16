export enum SkillApprovalStatus {
    APPROVED = "APPROVED",
    NOT_APPROVED = "NOT_APPROVED",
}

export interface UserSkill {
    id: number;
    skillId: number;
    userId: number;
    evidenceUrl: string | null;
    approvalStatus: SkillApprovalStatus
}

export interface UserSkillPageResult {
    data: UserSkill[];
    total?: number;
}

export type UpdateUserSkillDto = Omit<UserSkill, "id">