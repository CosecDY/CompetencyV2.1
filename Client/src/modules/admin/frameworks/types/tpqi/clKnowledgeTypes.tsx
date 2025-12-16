export interface ClKnowledge {
  id: number;
  careerLevelId: number;
  knowledgeId: number;
}

export interface ClKnowledgeView {
  id: number;
  careerLevelId: number;
  knowledgeId: number;

  knowledge: {
    id: number;
    name: string | null;
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

export interface ClKnowledgePageResult {
  data: ClKnowledgeView[];
  total?: number;
}

export type CreateClKnowledgeDto = Omit<ClKnowledge, "id">;
export type UpdateClKnowledgeDto = Partial<CreateClKnowledgeDto>;
