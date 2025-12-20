import api from "@Services/api";
import { GetSfiaSummaryService, SfiaSummaryStats } from "./getSfiaSummaryAPI";
import { GetTpqiSummaryService, TpqiSummaryStats } from "./getTpqiSummaryAPI";
import { PortfolioData } from "../types/portfolio";

// ==========================================
// Interfaces
// ==========================================

/**
 * ข้อมูลสำหรับส่งไปสร้าง Portfolio ใหม่
 */
export interface CreatePortfolioRequest {
  userId: string;
  name: string;
  description?: string;
  items: Array<{
    sourceType: "SFIA" | "TPQI";
    externalId: string; // SFIA=SkillCode, TPQI=ID
  }>;
}

export interface PortfolioListItem {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
  _count: {
    items: number;
  };
}

export interface CompletePortfolioData {
  userId: string;
  userEmail: string;
  portfolioInfo?: {
    id: string;
    name: string;
    description: string | null;
  };
  sfiaSummary: SfiaSummaryStats | null;
  tpqiSummary: TpqiSummaryStats | null;
  overallStats: {
    totalSfiaSkills: number;
    totalTpqiCareers: number;
    averageSfiaProgress: number;
    averageTpqiSkillProgress: number;
    averageTpqiKnowledgeProgress: number;
  };
  lastUpdated: string;
}

// ==========================================
// Service Class
// ==========================================

export class PortfolioService {
  private readonly sfiaService: GetSfiaSummaryService;
  private readonly tpqiService: GetTpqiSummaryService;

  constructor() {
    this.sfiaService = new GetSfiaSummaryService();
    this.tpqiService = new GetTpqiSummaryService();
  }

  /**
   * 1. GET MASTER DATA: ดึงข้อมูล "ทั้งหมด" (เพื่อเอาไปเลือกสร้าง Portfolio)
   * ใช้ sub-services ดึงข้อมูลดิบจาก SFIA และ TPQI
   */
  async getMasterPortfolioData(userId: string, userEmail: string): Promise<CompletePortfolioData> {
    try {
      const [sfiaResponse, tpqiResponse] = await Promise.allSettled([this.sfiaService.getUserSummary(), this.tpqiService.getUserSummary()]);

      // Process SFIA
      let sfiaSummary: SfiaSummaryStats | null = null;
      if (sfiaResponse.status === "fulfilled" && sfiaResponse.value.success) {
        sfiaSummary = sfiaResponse.value.data || null;
      }

      // Process TPQI
      let tpqiSummary: TpqiSummaryStats | null = null;
      if (tpqiResponse.status === "fulfilled" && tpqiResponse.value.success) {
        tpqiSummary = tpqiResponse.value.data || null;
      }

      // คำนวณ Stats รวม
      const overallStats = this.calculateOverallStats(sfiaSummary, tpqiSummary);

      return {
        userId,
        userEmail,
        sfiaSummary,
        tpqiSummary,
        overallStats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching master data:", error);
      throw new Error("ไม่สามารถโหลดข้อมูล Master Data ได้");
    }
  }

  /**
   * 2. CREATE: สร้าง Portfolio ใหม่
   */
  async createPortfolio(data: CreatePortfolioRequest): Promise<{ success: boolean; portfolioId?: string; error?: string }> {
    try {
      const response = await api.post("/competency/portfolio/create", data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to create portfolio:", error);
      return {
        success: false,
        error: error.response?.data?.message || "สร้าง Portfolio ไม่สำเร็จ",
      };
    }
  }

  /**
   * 3. LIST: ดึงรายชื่อ Portfolio ทั้งหมดของ User (Dashboard)
   */
  async getUserPortfolios(userId: string): Promise<PortfolioListItem[]> {
    try {
      const response = await api.get(`/competency/portfolio/user/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Failed to list portfolios:", error);
      return [];
    }
  }

  /**
   * 4. GET BY ID: ดึงข้อมูล Portfolio รายเล่ม (View Detail)
   */
  async getPortfolioById(portfolioId: string): Promise<PortfolioData | null> {
    try {
      const response = await api.get(`/competency/portfolio/${portfolioId}`);
      if (response.data.success) {
        const rawData = response.data.data as CompletePortfolioData;
        return this.convertToPortfolioData(rawData);
      }
      return null;
    } catch (error) {
      console.error(`Error fetching portfolio ${portfolioId}:`, error);
      return null;
    }
  }

  async updatePortfolio(id: string, data: { name: string; description: string; items: any[] }) {
    const response = await api.put(`/competency/portfolio/${id}`, data);
    return response.data;
  }

  /**
   * 5. DELETE: ลบ Portfolio
   */
  async deletePortfolio(portfolioId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/competency/portfolio/${portfolioId}`);
      return response.data.success;
    } catch (error) {
      console.error(`Error deleting portfolio ${portfolioId}:`, error);
      return false;
    }
  }

  // ==========================================
  // Helpers / Mappers
  // ==========================================

  convertToPortfolioData(data: CompletePortfolioData): PortfolioData {
    // SFIA Mapping
    const sfiaSkills =
      data.sfiaSummary?.skillSummaries?.map((skill) => ({
        id: skill.id,
        userId: data.userId,
        userEmail: data.userEmail,
        skillCode: skill.skillCode,
        levelId: skill.levelId,
        skillPercent: skill.skillPercent,
        // Map ให้เข้ากับ structure ลึกๆ ของ UI เดิม
        skill: {
          code: skill.skillCode,
          name: skill.skillName,
          overview: `ทักษะ ${skill.skillName}`,
          note: null,
          levelId: skill.levelId,
          categoryId: 0,
          category: { id: 0, name: skill.categoryName, subcategoryId: null },
          levels: [],
          subSkills: [],
        },
        level: {
          id: skill.levelId,
          name: skill.levelName,
          skillCode: skill.skillCode,
          descriptions: [],
        },
      })) || [];

    // TPQI Mapping
    const tpqiCareers =
      data.tpqiSummary?.careerSummaries?.map((career) => ({
        id: career.id,
        userId: data.userId,
        userEmail: data.userEmail,
        careerId: career.careerId,
        levelId: career.levelId,
        careerLevelId: career.careerLevelId,
        skillPercent: career.skillPercent || 0,
        knowledgePercent: career.knowledgePercent || 0,
        career: { id: career.careerId, name: career.careerName || "อาชีพไม่ระบุ" },
        careerLevel: { id: career.careerLevelId, careerId: career.careerId, levelId: career.levelId },
        level: { id: career.levelId, name: career.levelName || "ระดับไม่ระบุ" },
      })) || [];

    return {
      userId: data.userId,
      userEmail: data.userEmail,
      portfolioId: data.portfolioInfo?.id,
      portfolioName: data.portfolioInfo?.name,
      portfolioDescription: data.portfolioInfo?.description,
      sfiaSkills,
      tpqiCareers,
      overallStats: data.overallStats,
    };
  }

  /**
   * คำนวณ Stats รวม
   */
  private calculateOverallStats(sfia: SfiaSummaryStats | null, tpqi: TpqiSummaryStats | null) {
    return {
      totalSfiaSkills: sfia?.totalSkills || 0,
      totalTpqiCareers: tpqi?.totalCareers || 0,
      averageSfiaProgress: sfia?.averagePercent || 0,
      averageTpqiSkillProgress: tpqi?.averageSkillPercent || 0,
      averageTpqiKnowledgeProgress: tpqi?.averageKnowledgePercent || 0,
    };
  }

  // Helper สำหรับ Hook (Validation)
  validateServiceConfig() {
    return { isValid: true };
  }

  // Helper สำหรับสร้าง Recommendation (Logic เดิม)
  generateRecommendations(portfolioData: CompletePortfolioData): string[] {
    const recommendations: string[] = [];

    // SFIA Recs
    if (portfolioData.sfiaSummary?.averagePercent && portfolioData.sfiaSummary.averagePercent < 50) {
      recommendations.push("ควรเน้นการพัฒนาทักษะ SFIA ให้ถึงระดับความชำนาญขั้นกลาง");
    }

    // TPQI Recs
    if (portfolioData.tpqiSummary) {
      // เรียก logic balance จาก tpqiService ได้
      const balance = this.tpqiService.analyzeSkillKnowledgeBalance(portfolioData.tpqiSummary);
      if (balance.recommendedFocus === "skills") recommendations.push("ควรเพิ่มทักษะปฏิบัติ");
      if (balance.recommendedFocus === "knowledge") recommendations.push("ควรเพิ่มความรู้ทฤษฎี");
    }

    return recommendations;
  }
}
