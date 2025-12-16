// /Client/src/pages/competencyDetail/types/tpqi.ts
export interface TpqiSkill {
  id: number;
  skill_name: string;
  skill_description?: string;
}

export interface TpqiKnowledge {
  id: number;
  knowledge_name: string;
  knowledge_description?: string;
}

export interface TpqiUnit {
  id: number;
  unit_code: string;
  unit_name: string;
  skills: TpqiSkill[];
  knowledge: TpqiKnowledge[];
}

export interface SubmitTpqiEvidenceRequest {
  skillId?: number;
  knowledgeId?: number;
  evidenceUrl?: string;
}

export interface TpqiEvidenceResponseData {
  id: number;
  userId: string;
  skillId?: number;
  knowledgeId?: number;
  evidenceUrl?: string | null;
  approvalStatus: string;
}

export interface TpqiApiResponse {
  success: boolean;
  message: string;
  data?: TpqiEvidenceResponseData;
}

export interface TpqiEvidenceState {
  urls: { [id: string]: string }; // Evidence URLs for each skill/knowledge ID
  submitted: { [id: string]: boolean }; // Submission status
  loading: { [id: string]: boolean }; // Loading states
  errors: { [id: string]: string }; // Error messages
  approvalStatus: { [id: string]: string }; // Approval status
}

export interface EvidenceType {
  type: "skill" | "knowledge";
  id: number;
}

export interface TpqiCompetency {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  occupational: {
    id: number;
    occupational_text: string | null;
  } | null;
  skills: TpqiSkill[];
  knowledge: TpqiKnowledge[];
}
