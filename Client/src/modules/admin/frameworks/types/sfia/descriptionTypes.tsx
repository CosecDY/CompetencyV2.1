export interface Description {
  id: number;
  text?: string | null;
  levelId?: number | null;
}

export interface DescriptionPageResult {
  data: Description[];
  total?: number;
}

export type CreateDescriptionDto = Omit<Description, "id">;
export type UpdateDescriptionDto = Partial<Omit<Description, "id">>;
