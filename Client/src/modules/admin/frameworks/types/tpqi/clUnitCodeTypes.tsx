export interface ClUnitCode {
  id: number;
  careerLevelId: number;
  unitCodeId: number;
}

export interface ClUnitCodeView {
    id: number;
    careerLevelId: number;
    unitCodeId: number;

    unitCode: {
        id: number;
        name: string | null;
        code: string | null;
        description: string | null;
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

export interface ClUnitCodePageResult {
    data: ClUnitCodeView[];
    total?: number;
}

export type CreateClUnitCodeDto = Omit<ClUnitCode, "id">;
export type UpdateClUnitCodeDto = Partial<CreateClUnitCodeDto>;