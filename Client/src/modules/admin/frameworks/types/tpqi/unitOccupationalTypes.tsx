export interface UnitOccupational {
    id: number;
    unitCodeId: number;
    occupationalId: number;
}

export interface UnitOccupationalView {
    id: number;
    unitCodeId: number;
    occupationalId: number;

    unitCode: {
        id: number;
        name: string | null;
        code: string | null;
        description: string | null;
    } | null;

    occupational: {
        id: number;
        name: string | null;
    } | null;

}

export interface UnitOccupationalPageResult {
    data: UnitOccupationalView[];
    total?: number;
}

export type CreateucOccupationalDto = Omit<UnitOccupational, "id">;
export type UpdateucOccupationalDto = Partial<CreateucOccupationalDto>;
