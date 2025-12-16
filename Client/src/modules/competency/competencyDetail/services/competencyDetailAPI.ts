import api from "@Services/api";

// Enhanced error class
export class APIError extends Error {
  constructor(message: string, public status?: number, public response?: any, public source?: string) {
    super(message);
    this.name = "APIError";
  }
}

// Types
export interface SfiaSkillDetail {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  category: { id: number; category_text: string | null } | null;
  levels: Array<{
    id: number;
    level_name: string | null;
    descriptions: Array<{
      id: number;
      description_text: string | null;
      subskills: Array<{ id: number; subskill_text: string | null }>;
    }>;
  }>;
}

export interface SfiaSkillResponse {
  competency: SfiaSkillDetail | null;
  totalLevels: number;
  totalSkills: number;
}

export interface TpqiUnitDetail {
  competency_id: string;
  competency_name: string | null;
  overall: string | null;
  note: string | null;
  occupational: Array<{ id: number; name_occupational: string }>;
  sector: Array<{ id: number; name_sector: string }>;
  skills: Array<{ id: number; name_skill: string }>;
  knowledge: Array<{ id: number; name_knowledge: string }>;
}

export interface TpqiUnitResponse {
  competency: TpqiUnitDetail | null;
  totalSkills: number;
  totalKnowledge: number;
  totalOccupational: number;
  totalSector: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ------------------- Internal Fetch Functions -------------------
async function fetchSfiaSkillDetail(skillCode: string): Promise<SfiaSkillResponse> {
  try {
    const { data } = await api.get<ApiResponse<SfiaSkillResponse>>(`/sfia/skills/${encodeURIComponent(skillCode)}`, { headers: { "Content-Type": "application/json" } });

    if (!data.success || !data.data) {
      throw new APIError(data.message || "Failed to get skill details", 400, data, "sfia");
    }
    return data.data;
  } catch (error: any) {
    if (error.response) {
      throw new APIError(error.response.data?.message || error.message, error.response.status, error.response, "sfia");
    }
    throw new APIError(error.message || "Unknown error", 0, undefined, "sfia");
  }
}

async function fetchTpqiUnitDetail(unitCode: string): Promise<TpqiUnitResponse> {
  try {
    const { data } = await api.get<ApiResponse<TpqiUnitResponse>>(`/tpqi/unitcodes/${encodeURIComponent(unitCode)}`, { headers: { "Content-Type": "application/json" } });

    if (!data.success || !data.data) {
      throw new APIError(data.message || "Failed to get unit code details", 400, data, "tpqi");
    }
    return data.data;
  } catch (error: any) {
    if (error.response) {
      throw new APIError(error.response.data?.message || error.message, error.response.status, error.response, "tpqi");
    }
    throw new APIError(error.message || "Unknown error", 0, undefined, "tpqi");
  }
}

// ------------------- Public API -------------------
export async function fetchSfiaSkillDetailByCode(skillCode: string): Promise<SfiaSkillResponse> {
  if (!skillCode.trim()) {
    throw new APIError("Skill code cannot be empty");
  }

  return await fetchSfiaSkillDetail(skillCode);
}

export async function fetchTpqiUnitDetailByCode(unitCode: string): Promise<TpqiUnitResponse> {
  if (!unitCode.trim()) {
    throw new APIError("Unit code cannot be empty");
  }

  return await fetchTpqiUnitDetail(unitCode);
}

export async function fetchCompetencyDetailByCode(source: "sfia" | "tpqi", code: string): Promise<SfiaSkillResponse | TpqiUnitResponse> {
  if (!code.trim()) {
    throw new APIError("Competency code cannot be empty");
  }

  if (source === "sfia") return await fetchSfiaSkillDetailByCode(code);
  if (source === "tpqi") return await fetchTpqiUnitDetailByCode(code);
  throw new APIError(`Invalid source: ${source}`);
}

export async function fetchMultipleCompetencyDetails(requests: Array<{ source: "sfia" | "tpqi"; code: string }>) {
  return await Promise.all(
    requests.map(async ({ source, code }) => {
      try {
        const data = await fetchCompetencyDetailByCode(source, code);
        return { source, code, data };
      } catch (error) {
        const apiError = error instanceof APIError ? error : new APIError(`Unknown error for ${source} ${code}`);
        return { source, code, error: apiError };
      }
    })
  );
}

// ------------------- Utility Functions -------------------
export const isNetworkError = (error: unknown) => !!(error as any)?.message?.toLowerCase?.().includes("network");

export const isTimeoutError = (error: unknown) => !!(error as any)?.message?.toLowerCase?.().includes("timeout");

export const isNotFoundError = (error: unknown) => error instanceof APIError && error.status === 404;
