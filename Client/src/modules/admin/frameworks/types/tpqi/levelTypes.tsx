export interface Level {
    id: number;
    name?: string | null;
}

export interface LevelPageResult {
    data: Level[];
    total?: number;
}

export type CreateLevelDto = Omit<Level, "id">;
export type UpdateLevelDto = Partial<Omit<CreateLevelDto, "id">>;