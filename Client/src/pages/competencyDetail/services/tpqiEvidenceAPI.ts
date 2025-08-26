import api from "@Services/api";
import { AxiosError } from "axios";

/**
 * Local ApiResponse generic (safe small shape, avoid coupling)
 */
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * Expected raw data shape returned by backend for TPQI evidence get endpoint.
 * Adjust fields if your backend returns different names.
 */
interface RawTpqiEvidencePayload {
  skillEvidences?: Array<{
    id?: number | string;
    evidenceUrl?: string | null;
    approvalStatus?: string | null;
  }>;
  knowledgeEvidences?: Array<{
    id?: number | string;
    evidenceUrl?: string | null;
    approvalStatus?: string | null;
  }>;
}

/**
 * Transformed shape used by UI / hook
 */
export interface TpqiEvidenceData {
  skills: {
    [skillId: number]: { evidenceUrl: string; approvalStatus: string | null };
  };
  knowledge: {
    [knowledgeId: number]: { evidenceUrl: string; approvalStatus: string | null };
  };
}

/**
 * Fetch TPQI evidence by unitCode.
 * Returns normalized TpqiEvidenceData (always contains skills & knowledge objects).
 */
export async function fetchTpqiEvidenceByUnitCode(unitCode: string): Promise<TpqiEvidenceData> {
  try {
    const res = await api.post<ApiResponse<RawTpqiEvidencePayload>>("/tpqi/evidence/get", {
      unitCode,
    });

    const apiBody = res.data;

    if (!apiBody || !apiBody.success || !apiBody.data) {
      // return empty normalized structure if no data
      return { skills: {}, knowledge: {} };
    }

    const payload = apiBody.data;

    const transformed: TpqiEvidenceData = {
      skills: {},
      knowledge: {},
    };

    if (Array.isArray(payload.skillEvidences)) {
      payload.skillEvidences.forEach((item) => {
        const rawId = item.id;
        const id = typeof rawId === "string" ? parseInt(rawId, 10) : rawId;
        if (!id || !item.evidenceUrl) return;
        transformed.skills[id] = {
          evidenceUrl: item.evidenceUrl,
          approvalStatus: item.approvalStatus ?? null,
        };
      });
    }

    if (Array.isArray(payload.knowledgeEvidences)) {
      payload.knowledgeEvidences.forEach((item) => {
        const rawId = item.id;
        const id = typeof rawId === "string" ? parseInt(rawId, 10) : rawId;
        if (!id || !item.evidenceUrl) return;
        transformed.knowledge[id] = {
          evidenceUrl: item.evidenceUrl,
          approvalStatus: item.approvalStatus ?? null,
        };
      });
    }

    return transformed;
  } catch (err: unknown) {
    // Create a helpful message and rethrow
    let message = "Failed to fetch TPQI evidence";
    if (err instanceof AxiosError) {
      message = (err.response?.data as any)?.message ?? err.message ?? message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    // rethrow as Error so hooks can catch and set state as needed
    throw new Error(message);
  }
}
