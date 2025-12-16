// SFIA Schema Types
export interface SfiaSummary {
  id: number;
  userEmail: string | null;
  skillCode: string | null;
  levelId: number | null;
  skillPercent: number | null;
  skill?: SfiaSkill | null;
  level?: SfiaLevel | null;
}

export interface SfiaSkill {
  code: string;
  name: string | null;
  overview: string | null;
  note: string | null;
  levelId: number | null;
  categoryId: number | null;
  category?: SfiaCategory | null;
  levels: SfiaLevel[];
  subSkills: SfiaSubSkill[];
}

export interface SfiaLevel {
  id: number;
  name: string | null;
  skillCode: string | null;
  descriptions: SfiaDescription[];
}

export interface SfiaCategory {
  id: number;
  name: string | null;
  subcategoryId: number | null;
  subcategory?: SfiaSubcategory | null;
}

export interface SfiaSubcategory {
  id: number;
  name: string | null;
}

export interface SfiaDescription {
  id: number;
  text: string | null;
  levelId: number | null;
}

export interface SfiaSubSkill {
  id: number;
  skillCode: string;
  descriptionId: number;
  text: string | null;
}

// TPQI Schema Types
export interface TpqiSummary {
  id: number;
  userEmail: string;
  careerId: number;
  levelId: number;
  careerLevelId: number;
  skillPercent: number | null;
  knowledgePercent: number | null;
  career: TpqiCareer;
  careerLevel: TpqiCareerLevel;
  level: TpqiLevel;
}

export interface TpqiCareer {
  id: number;
  name: string;
}

export interface TpqiLevel {
  id: number;
  name: string;
}

export interface TpqiCareerLevel {
  id: number;
  careerId: number;
  levelId: number;
}

export interface TpqiKnowledge {
  id: number;
  name: string;
}

export interface TpqiSkill {
  id: number;
  name: string;
}

// Portfolio Combined Types
export interface PortfolioData {
  userEmail: string;
  sfiaSkills: SfiaSummary[];
  tpqiCareers: TpqiSummary[];
  overallStats: {
    totalSfiaSkills: number;
    totalTpqiCareers: number;
    averageSfiaProgress: number;
    averageTpqiSkillProgress: number;
    averageTpqiKnowledgeProgress: number;
  };
}

export interface SkillProgressItem {
  name: string;
  percentage: number;
  level?: string;
  category?: string;
  type: "sfia" | "tpqi-skill" | "tpqi-knowledge";
}
