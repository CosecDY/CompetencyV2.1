export interface UnitSector {
    id: number;
    unitCodeId: number;
    sectorId: number;
}

export interface UnitSectorView {
    id: number;
    unitCodeId: number;
    sectorId: number;

    unitCode: {
        id: number;
        name: string | null;
        code: string | null;
        description: string | null;
    } | null;

    sector: {
        id: number;
        name: string | null;
    } | null;
}

export interface UnitSectorPageResult {
    data: UnitSectorView[];
    total?: number;
}
export type CreateUnitSectorDto = Omit<UnitSector, "id">;
export type UpdateUnitSectorDto = Partial<CreateUnitSectorDto>;