export interface SubSkill {
  id: number;
  descriptionId: number;
  skillText?: string | null;
  skillCode: number;
}

export interface SubSkillPageResult {
  data: SubSkill[];
  total?: number;
}

export type CreateSubSkillDto = Omit<SubSkill, "id">
export type UpdateSubSkillDto = Partial<Omit<SubSkill, "id">>