export enum SkillApprovalStatus {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
}

export interface UserSkill {
  id: number;
  skillId: number;
  userId: number;
  evidenceUrl: string | null;
  approvalStatus: SkillApprovalStatus;
}

export interface UserSkillPageResult {
  data: UserSkill[];
  total?: number;
}

export type UpdateUserSkillDto = Omit<UserSkill, "id">;
