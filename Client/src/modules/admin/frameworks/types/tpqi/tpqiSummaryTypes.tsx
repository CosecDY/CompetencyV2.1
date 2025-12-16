export interface TPQISummary {
  id: number;
  userEmail: string | null;
  careerId: number | null;
  levelId: number | null;
  careerLevelId: number | null;
  skillPercent: string | number;
  knowledgePercent: string | number;
}

export interface TPQISummaryPageResult {
  data: TPQISummary[];
  total?: number;
}
