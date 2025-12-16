export interface ClDetail {
  id: number;
  detailsId: number;
  description: string;
  careerLevelId: number;
  careerLevel: {
    id: number;
    career: { id: number; name: string } | null;
    level: { id: number; name: string } | null;
  } | null;
}

export interface ClDetailPageResult {
  data: ClDetail[];
  total?: number;
}

export type CreateClDetailDto = {
  careerLevelId: number;
  description: string;
};

export type UpdateClDetailDto = Partial<CreateClDetailDto>;
