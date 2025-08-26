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
