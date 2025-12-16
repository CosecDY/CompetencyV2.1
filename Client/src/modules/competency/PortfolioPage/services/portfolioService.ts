import { GetSfiaSummaryService, SfiaSummaryStats } from "./getSfiaSummaryAPI";
import { GetTpqiSummaryService, TpqiSummaryStats } from "./getTpqiSummaryAPI";
import { PortfolioData } from "../types/portfolio";

/**
 * Interface for complete portfolio data combining SFIA and TPQI summaries.
 */
export interface CompletePortfolioData {
  userEmail: string;
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

/**
 * Service class for managing complete portfolio data.
 * Coordinates between SFIA and TPQI services to provide unified portfolio information.
 */
export class PortfolioService {
  private readonly sfiaService: GetSfiaSummaryService;
  private readonly tpqiService: GetTpqiSummaryService;

  constructor() {
    this.sfiaService = new GetSfiaSummaryService();
    this.tpqiService = new GetTpqiSummaryService();
  }

  /**
   * Fetches complete portfolio data including both SFIA and TPQI summaries.
   *
   * @param userEmail - The user's email address for the portfolio
   * @returns Promise<CompletePortfolioData> - Complete portfolio data
   */
  async getCompletePortfolioData(userEmail: string): Promise<CompletePortfolioData> {
    try {
      // Fetch both SFIA and TPQI data in parallel
      const [sfiaResponse, tpqiResponse] = await Promise.allSettled([this.sfiaService.getUserSummary(), this.tpqiService.getUserSummary()]);

      // Process SFIA data
      let sfiaSummary: SfiaSummaryStats | null = null;
      if (sfiaResponse.status === "fulfilled" && sfiaResponse.value.success) {
        sfiaSummary = sfiaResponse.value.data || null;
        console.log("Fetched SFIA summary:", sfiaSummary);
      } else {
        console.warn("Failed to fetch SFIA summary:", sfiaResponse.status === "rejected" ? sfiaResponse.reason : "API returned no data");
      }

      // Process TPQI data
      let tpqiSummary: TpqiSummaryStats | null = null;
      if (tpqiResponse.status === "fulfilled" && tpqiResponse.value.success) {
        tpqiSummary = tpqiResponse.value.data || null;
      } else {
        console.warn("Failed to fetch TPQI summary:", tpqiResponse.status === "rejected" ? tpqiResponse.reason : "API returned no data");
      }

      // Calculate overall statistics
      const overallStats = this.calculateOverallStats(sfiaSummary, tpqiSummary);

      return {
        userEmail,
        sfiaSummary,
        tpqiSummary,
        overallStats,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching complete portfolio data:", error);
      throw new Error("ไม่สามารถโหลดข้อมูลพอร์ตโฟลิโอได้");
    }
  }

  /**
   * Converts the complete portfolio data to the format expected by the Portfolio page.
   *
   * @param portfolioData - The complete portfolio data
   * @returns PortfolioData formatted for the UI
   */
  convertToPortfolioData(portfolioData: CompletePortfolioData): PortfolioData {
    console.log("Converting portfolio data:", portfolioData);

    // Convert SFIA summary to sfiaSkills format
    const sfiaSkills =
      portfolioData.sfiaSummary?.skillSummaries?.map((skill) => {
        console.log("Converting skill:", skill);
        return {
          id: skill.id,
          userEmail: portfolioData.userEmail, // Use the userEmail from portfolio data
          skillCode: skill.skillCode,
          levelId: skill.levelId,
          skillPercent: skill.skillPercent,
          skill: {
            code: skill.skillCode,
            name: skill.skillName,
            overview: `ทักษะ ${skill.skillName}`, // Provide a default overview
            note: null,
            levelId: skill.levelId,
            categoryId: 0, // Default value, could be improved with actual category mapping
            category: {
              id: 0, // Default value
              name: skill.categoryName,
              subcategoryId: null,
            },
            levels: [], // These would need to be fetched separately if needed
            subSkills: [], // These would need to be fetched separately if needed
          },
          level: {
            id: skill.levelId,
            name: skill.levelName,
            skillCode: skill.skillCode,
            descriptions: [], // These would need to be fetched separately if needed
          },
        };
      }) || [];

    console.log("Converted SFIA skills:", sfiaSkills);

    console.log("Converted SFIA skills:", sfiaSkills);

    // Convert TPQI summary to tpqiCareers format
    const tpqiCareers =
      portfolioData.tpqiSummary?.careerSummaries?.map((career) => ({
        id: career.id,
        userEmail: portfolioData.userEmail,
        careerId: career.careerId,
        levelId: career.levelId,
        careerLevelId: career.careerLevelId,
        skillPercent: career.skillPercent || 0,
        knowledgePercent: career.knowledgePercent || 0,
        career: {
          id: career.careerId,
          name: career.careerName || "อาชีพไม่ระบุ",
        },
        careerLevel: {
          id: career.careerLevelId,
          careerId: career.careerId,
          levelId: career.levelId,
        },
        level: {
          id: career.levelId,
          name: career.levelName || "ระดับไม่ระบุ",
        },
      })) || [];

    return {
      userEmail: portfolioData.userEmail,
      sfiaSkills,
      tpqiCareers,
      overallStats: portfolioData.overallStats,
    };
  }

  /**
   * Calculates overall statistics from SFIA and TPQI summaries.
   *
   * @param sfiaSummary - SFIA summary data
   * @param tpqiSummary - TPQI summary data
   * @returns Overall statistics object
   */
  private calculateOverallStats(sfiaSummary: SfiaSummaryStats | null, tpqiSummary: TpqiSummaryStats | null) {
    return {
      totalSfiaSkills: sfiaSummary?.totalSkills || 0,
      totalTpqiCareers: tpqiSummary?.totalCareers || 0,
      averageSfiaProgress: sfiaSummary?.averagePercent || 0, // Changed from avgSkillPercent to averagePercent
      averageTpqiSkillProgress: tpqiSummary?.averageSkillPercent || 0,
      averageTpqiKnowledgeProgress: tpqiSummary?.averageKnowledgePercent || 0,
    };
  }

  /**
   * Validates the service configuration.
   *
   * @returns Object containing validation result and potential error message
   */
  validateServiceConfig(): {
    isValid: boolean;
    error?: string;
  } {
    return {
      isValid: true,
    };
  }

  /**
   * Checks if the portfolio has any data.
   *
   * @param portfolioData - The portfolio data to check
   * @returns boolean indicating if portfolio has data
   */
  hasPortfolioData(portfolioData: CompletePortfolioData): boolean {
    return (portfolioData.sfiaSummary?.skillSummaries?.length ?? 0) > 0 || (portfolioData.tpqiSummary?.careerSummaries?.length ?? 0) > 0;
  }

  /**
   * Generates recommendations based on portfolio data.
   *
   * @param portfolioData - The complete portfolio data
   * @returns Array of recommendation strings
   */
  generateRecommendations(portfolioData: CompletePortfolioData): string[] {
    const recommendations: string[] = [];

    // SFIA recommendations
    if (portfolioData.sfiaSummary?.averagePercent !== undefined) {
      if (portfolioData.sfiaSummary.averagePercent < 50) {
        recommendations.push("ควรเน้นการพัฒนาทักษะ SFIA ให้ถึงระดับความชำนาญขั้นกลาง");
      }
      if ((portfolioData.sfiaSummary.totalSkills ?? 0) < 5) {
        recommendations.push("ขยายพอร์ตโฟลิโอทักษะของคุณโดยการสำรวจและพัฒนาสมรรถนะ SFIA เพิ่มเติม");
      }
    }

    // TPQI recommendations
    if (portfolioData.tpqiSummary?.averageSkillPercent !== undefined) {
      const tpqiBalance = this.tpqiService.analyzeSkillKnowledgeBalance(portfolioData.tpqiSummary);
      if (tpqiBalance.recommendedFocus === "skills") {
        recommendations.push("ความรู้ของคุณแข็งแกร่งมาก ควรพัฒนาทักษะปฏิบัติเพื่อเสริมความเข้าใจทางทฤษฎี");
      } else if (tpqiBalance.recommendedFocus === "knowledge") {
        recommendations.push("ทักษะปฏิบัติของคุณดีมาก ควรเสริมสร้างพื้นฐานความรู้ทางทฤษฎี");
      }
    }

    // Overall recommendations
    if (!portfolioData.sfiaSummary?.skillSummaries?.length && !portfolioData.tpqiSummary?.careerSummaries?.length) {
      recommendations.push("เริ่มสร้างพอร์ตโฟลิโอวิชาชีพของคุณโดยการทำแบบประเมินทักษะและการประเมินอาชีพ");
    }

    return recommendations;
  }
}
