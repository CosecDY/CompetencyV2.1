export interface UnitSkill {
    id: number;
    unitCodeId: number;
    skillId: number;
}

export interface UnitSkillView {
    id: number;
    unitCodeId: number;
    skillId: number;

    UnitCode?: {
        id: number;
        name: string | null;
        code: string | null;
        description: string | null;
    } | null;

    Skill?: {
        id: number;
        name: string | null;
    } | null;
}

export interface UnitSkillPageResult {
    data: UnitSkillView[];
    total?: number;
}

export type CreateUnitSkillDto = Omit<UnitSkill, "id">;
export type UpdateUnitSkillDto = Partial<CreateUnitSkillDto>;
