export interface Knowledge {
    id: number;
    name?: string | null;
}

export interface KnowledgePageResult {
    data: Knowledge[];
    total?: number;
}

export type CreateKnowledgeDto = Omit<Knowledge, "id">;
export type UpdateKnowledgeDto = Partial<Omit<CreateKnowledgeDto, "id">>;