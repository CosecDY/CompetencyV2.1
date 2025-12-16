export interface SFIASummary {
    id: number;
    userId: string | null;
    skillCode: string | null;
    levelId: number | null;
    skillPercent: number | number;
}

export interface SFIASummaryPageResult {
    data: SFIASummary[];
    total?: number;
}