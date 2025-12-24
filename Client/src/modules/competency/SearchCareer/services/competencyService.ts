import axios from "axios";
import api from "@Services/api";

// ==========================================
// Interfaces (DTOs)
// ==========================================

export interface CompetencySearchResult {
  id: string | number;
  source: "TPQI" | "SFIA";
  title: string;
  category: string;
  description: string;
  availableLevels: number[];
}

export interface EvidenceItem {
  itemId: number;
  type?: "SKILL" | "KNOWLEDGE";
  text: string;
  description?: string;
  evidenceUrl: string | null;
  status: "APPROVED" | "PENDING" | "EMPTY" | "REJECTED";
}

export interface CompetencyDetail {
  source: "TPQI" | "SFIA";
  id: string | number;
  title: string;
  level: number;
  category: string;
  description: string;
  items: EvidenceItem[];
}

export interface SaveEvidenceRequest {
  source: "TPQI" | "SFIA";
  itemId: number;
  url: string;
  type?: "SKILL" | "KNOWLEDGE" | "PERFORMANCE";
}

export interface DeleteEvidenceRequest {
  source: "TPQI" | "SFIA";
  itemId: number;
  tpqiType?: "SKILL" | "KNOWLEDGE";
}

// ==========================================
// Service Class
// ==========================================

export class CompetencyService {
  /**
   * 1. SEARCH
   */
  async search(keyword: string, options?: { signal?: AbortSignal }): Promise<CompetencySearchResult[]> {
    try {
      const response = await api.get<CompetencySearchResult[]>("/competency/searchCareer", {
        params: { q: keyword },
        signal: options?.signal,
      });
      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }

      console.error("[CompetencyService] Search Error:", error);
      return [];
    }
  }

  /**
   * 2. GET DETAIL
   */
  async getDetail(source: "TPQI" | "SFIA", id: string | number, level: number): Promise<CompetencyDetail | null> {
    try {
      const response = await api.get<CompetencyDetail>("/competency/detail", {
        params: { source, id, level },
      });
      return response.data;
    } catch (error) {
      console.error("[CompetencyService] Get Detail Error:", error);
      throw new Error("ไม่สามารถโหลดรายละเอียดสมรรถนะได้");
    }
  }

  /**
   * 3. SAVE EVIDENCE
   */
  async saveEvidence(data: SaveEvidenceRequest): Promise<boolean> {
    try {
      const response = await api.post("/competency/evidence", data);
      return response.status === 200 || response.status === 201;
    } catch (error: any) {
      console.error("[CompetencyService] Save Evidence Error:", error);
      const backendMessage = error.response?.data?.error;
      throw new Error(backendMessage || "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }

  /**
   * 4. DELETE EVIDENCE
   */
  async deleteEvidence(data: DeleteEvidenceRequest): Promise<boolean> {
    try {
      const response = await api.delete("/competency/evidence", {
        data: data,
      });
      return response.status === 200;
    } catch (error: any) {
      console.error("[CompetencyService] Delete Evidence Error:", error);
      const backendMessage = error.response?.data?.error;
      throw new Error(backendMessage || "ลบข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }
}
