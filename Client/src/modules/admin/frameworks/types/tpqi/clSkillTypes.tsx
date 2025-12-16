export interface ClSkill {
    id: number;
    careerLevelId: number;
    skillId: number;
}

export interface ClSkillView {
    id: number;
    careerLevelId: number;
    skillId: number;

    skill: {
        id: number;
        name: string | null;
    } | null;
    careerLevel: {
        id: number;
        careerId: number;
        levelId: number;
        career: {
            id: number;
            name: string | null;
        } | null;
        level: {
            id: number;
            name: string | null;
        } | null;
    } | null;
}

export interface ClSkillPageResult {
    data: ClSkillView[];
    total?: number;
}

export type CreateClSkillDto = Omit<ClSkill, "id">;
export type UpdateClSkillDto = Partial<CreateClSkillDto>;