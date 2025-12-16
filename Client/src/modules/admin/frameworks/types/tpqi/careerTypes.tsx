export interface Career {
  id: number;
  name?: string | null;
}

export interface CareerPageResult {
  data: Career[];
  total?: number;
}


export type CreateCareerDto = Omit<Career, "id">;
export type UpdateCareerDto = Partial<CreateCareerDto>;

