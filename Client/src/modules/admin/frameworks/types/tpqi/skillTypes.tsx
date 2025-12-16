export interface Skill{
    id: number;
    name?: string | null;
}

export interface SkillPageResult {
    data: Skill[];
    total?: number;
}

export type CreateSkillDto = Omit<Skill, "id">;
export type UpdateSkillDto = Partial<Omit<CreateSkillDto, "id">>;