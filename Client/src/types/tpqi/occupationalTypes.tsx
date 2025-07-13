export interface Occupational {
  id: number;
    name?: string | null;
}

export interface OccupationalPageResult {
    data: Occupational[];
    total?: number;
}

export type CreateOccupationalDto = Omit<Occupational, "id">;
export type UpdateOccupationalDto = Partial<Omit<CreateOccupationalDto, "id">>;