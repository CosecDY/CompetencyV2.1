import api from "@Services/api";

// ==========================================
// Interfaces (DTOs)
// ==========================================

/**
 * ผลลัพธ์การค้นหา (สำหรับแสดงในหน้า Search Result)
 */
export interface CompetencySearchResult {
  id: string | number; // TPQI=ID (number), SFIA=Code (string)
  source: "TPQI" | "SFIA";
  title: string; // ชื่ออาชีพ หรือ Skill
  category: string; // หมวดหมู่ / สาขา
  description: string;
  availableLevels: number[]; // เลเวลที่มีให้เลือก เช่น [3, 4, 5]
}

/**
 * โครงสร้างข้อมูล Evidence ย่อย (Skill / SubSkill)
 */
export interface EvidenceItem {
  itemId: number; // TPQI=SkillId, SFIA=SubSkillId
  text: string;
  description?: string;
  evidenceUrl: string | null;
  status: "APPROVED" | "PENDING" | "EMPTY" | "REJECTED";
}

/**
 * รายละเอียดแบบเต็มของอาชีพ/ทักษะ (สำหรับหน้ากรอกข้อมูล)
 */
export interface CompetencyDetail {
  source: "TPQI" | "SFIA";
  id: string | number;
  title: string;
  level: number;
  category: string;
  description: string;
  items: EvidenceItem[];
}

/**
 * ข้อมูลสำหรับส่งไปบันทึก Evidence
 */
export interface SaveEvidenceRequest {
  source: "TPQI" | "SFIA";
  itemId: number;
  url: string;
}

// ==========================================
// Service Class
// ==========================================

export class CompetencyService {
  /**
   * 1. SEARCH: ค้นหาอาชีพ (TPQI) หรือทักษะ (SFIA)
   * GET /api/competency/search?q=keyword
   */
  async search(keyword: string): Promise<CompetencySearchResult[]> {
    try {
      const response = await api.get<CompetencySearchResult[]>("/competency/searchCareer", {
        params: { q: keyword },
      });
      return response.data;
    } catch (error) {
      console.error("[CompetencyService] Search Error:", error);
      return [];
    }
  }

  /**
   * 2. GET DETAIL: ดึงรายละเอียดและสถานะการส่งงาน
   * GET /api/competency/detail?source=...&id=...&level=...
   */
  async getDetail(source: "TPQI" | "SFIA", id: string | number, level: number): Promise<CompetencyDetail | null> {
    try {
      const response = await api.get<CompetencyDetail>("/competency/detail", {
        params: {
          source,
          id,
          level,
        },
      });
      return response.data;
    } catch (error) {
      console.error("[CompetencyService] Get Detail Error:", error);
      throw new Error("ไม่สามารถโหลดรายละเอียดสมรรถนะได้");
    }
  }

  /**
   * 3. SAVE EVIDENCE: บันทึก Link หลักฐาน
   * POST /api/competency/evidence
   */
  async saveEvidence(data: SaveEvidenceRequest): Promise<boolean> {
    try {
      const response = await api.post("/competency/evidence", data);
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error("[CompetencyService] Save Evidence Error:", error);
      throw new Error("บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    }
  }
}
