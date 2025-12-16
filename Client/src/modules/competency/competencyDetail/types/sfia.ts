export interface SfiaSubSkill {
  id: number;
  subskill_text: string | null;
}

export interface SfiaDescription {
  id: number;
  description_text: string | null;
  subskills: SfiaSubSkill[];
}

export interface SfiaLevel {
  id: number;
  level_name: string | null;
  descriptions: SfiaDescription[];
}

// Represents a full SFIA competency, including metadata and its levels
export interface SfiaCompetency {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  category: {
    id: number;
    category_text: string | null;
  } | null;
  levels: SfiaLevel[];
}

export interface SubmitEvidenceRequest {
  subSkillId: number;
  evidenceText: string;
  evidenceUrl?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface EvidenceState {
  urls: {
    [subSkillId: string]: {
      evidenceUrl: string;
      approvalStatus: string | null;
    };
  };
  submitted: { [subSkillId: string]: boolean };
  loading: { [subSkillId: string]: boolean };
  deleting: { [subSkillId: string]: boolean };
  errors: { [subSkillId: string]: string };
  approvalStatus: { [subSkillId: string]: string | null };
}
