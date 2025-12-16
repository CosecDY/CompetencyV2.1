export type CompetencyResponse = {
  source: "sfia" | "tpqi";
  Competencies: Array<{ name: string; id: string }>;
};
