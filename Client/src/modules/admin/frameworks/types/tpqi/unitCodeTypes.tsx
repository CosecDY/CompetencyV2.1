export interface UnitCode {
    id: number;
    code: string;
    name?: string | null;
    description?: string | null;
}

export interface UnitCodePageResult {
    data: UnitCode[];
    total?: number;
}

export type CreateUnitCodeDto = Omit<UnitCode, "id">;
export type UpdateUnitCodeDto = Partial<Omit<CreateUnitCodeDto, "id">>;