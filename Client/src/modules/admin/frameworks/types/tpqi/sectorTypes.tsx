export interface Sector {
    id: number;
    name?: string | null;
}

export interface SectorPageResult {
    data: Sector[];
    total?: number;
}

export type CreateSectorDto = Omit<Sector, "id">;
export type UpdateSectorDto = Partial<Omit<CreateSectorDto, "id">>;