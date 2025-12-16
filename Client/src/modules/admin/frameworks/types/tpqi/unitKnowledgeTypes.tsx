export interface UnitKnowledge {
    id: number;
    unitCodeId: number;
    knowledgeId: number;
}

export interface UnitKnowledgeView {
    id: number;
    unitCodeId: number;
    knowledgeId: number;

    UnitCode?: {
        id: number;
        name: string | null;
        code: string | null;
        description: string | null;
    } | null;

    Knowledge?: {
        id: number;
        name: string | null;
    } | null;
}

export interface UnitKnowledgePageResult {
    data: UnitKnowledgeView[];
    total?: number;
}

export type CreateUnitKnowledgeDto = Omit<UnitKnowledge, "id">;
export type UpdateUnitKnowledgeDto = Partial<CreateUnitKnowledgeDto>;
