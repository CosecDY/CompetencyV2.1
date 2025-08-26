import api from "@Services/api";
import { ApiResponse } from "../../types/competency/ApiResponse";

/**
 * Interface for TPQI career summary data from the backend.
 */
export interface TpqiCareerSummary {
  id: number;
  careerId: number;
  careerName: string | null;
  levelId: number;
  levelName: string | null;
  careerLevelId: number;
  skillPercent: number | null;
  knowledgePercent: number | null;
}

/**
 * Interface for the overall TPQI summary statistics.
 */
export interface TpqiSummaryStats {
  totalCareers: number;
  averageSkillPercent: number;
  averageKnowledgePercent: number;
  completedCareers: number;
  careerSummaries: TpqiCareerSummary[];
}

/**
 * Extended API response for TPQI summary retrieval.
 */
export interface GetTpqiSummaryResponse extends ApiResponse {
  data?: TpqiSummaryStats;
}

/**
 * Service class for retrieving TPQI user summary.
 */
export class GetTpqiSummaryService {
  /**
   * Retrieves the TPQI summary for the authenticated user.
   *
   * @returns Promise<GetTpqiSummaryResponse>
   * @throws Error if the API request fails
   */
  async getUserSummary(): Promise<GetTpqiSummaryResponse> {
    try {
      const response = await api.get<GetTpqiSummaryResponse>("/tpqi/summary/user");
      return response.data;
    } catch (error) {
      console.error("Error fetching TPQI summary:", error);
      if (error instanceof Error) throw error;
      throw new Error("Failed to fetch TPQI summary");
    }
  }

  /**
   * Checks if the response contains valid summary data.
   */
  hasSummaryData(response: GetTpqiSummaryResponse): boolean {
    return response.success && !!response.data && Array.isArray(response.data.careerSummaries) && response.data.careerSummaries.length > 0;
  }

  /**
   * Calculates additional statistics from the summary data.
   */
  calculateAdditionalStats(summaryData: TpqiSummaryStats): {
    highPerformanceCareers: TpqiCareerSummary[];
    careersByLevel: Map<string, TpqiCareerSummary[]>;
    skillVsKnowledgeGap: TpqiCareerSummary[];
  } {
    const highPerformanceCareers = summaryData.careerSummaries.filter((career) => (career.skillPercent || 0) >= 80 && (career.knowledgePercent || 0) >= 80);

    const careersByLevel = new Map<string, TpqiCareerSummary[]>();
    summaryData.careerSummaries.forEach((career) => {
      const levelName = career.levelName || "Unknown";
      if (!careersByLevel.has(levelName)) {
        careersByLevel.set(levelName, []);
      }
      careersByLevel.get(levelName)!.push(career);
    });

    const skillVsKnowledgeGap = summaryData.careerSummaries.filter((career) => {
      const skillPercent = career.skillPercent || 0;
      const knowledgePercent = career.knowledgePercent || 0;
      return Math.abs(skillPercent - knowledgePercent) >= 20;
    });

    return {
      highPerformanceCareers,
      careersByLevel,
      skillVsKnowledgeGap,
    };
  }

  /**
   * Formats the summary data for display purposes.
   */
  formatSummaryForDisplay(summaryData: TpqiSummaryStats): {
    formattedCareers: Array<{
      careerName: string;
      level: string;
      skillProgress: number;
      knowledgeProgress: number;
      skillProgressFormatted: string;
      knowledgeProgressFormatted: string;
      overallProgress: number;
      overallProgressFormatted: string;
    }>;
    overallSkillProgress: string;
    overallKnowledgeProgress: string;
    completionRate: string;
  } {
    const formattedCareers = summaryData.careerSummaries.map((career) => {
      const skillPercent = career.skillPercent || 0;
      const knowledgePercent = career.knowledgePercent || 0;
      const overallProgress = (skillPercent + knowledgePercent) / 2;

      return {
        careerName: career.careerName || "Unknown Career",
        level: career.levelName || "Unknown Level",
        skillProgress: skillPercent,
        knowledgeProgress: knowledgePercent,
        skillProgressFormatted: `${skillPercent}%`,
        knowledgeProgressFormatted: `${knowledgePercent}%`,
        overallProgress: Math.round(overallProgress * 100) / 100,
        overallProgressFormatted: `${Math.round(overallProgress * 100) / 100}%`,
      };
    });

    const overallSkillProgress = `${summaryData.averageSkillPercent}%`;
    const overallKnowledgeProgress = `${summaryData.averageKnowledgePercent}%`;
    const completionRate = `${summaryData.completedCareers}/${summaryData.totalCareers}`;

    return {
      formattedCareers,
      overallSkillProgress,
      overallKnowledgeProgress,
      completionRate,
    };
  }

  /**
   * Analyzes skill vs knowledge balance.
   */
  analyzeSkillKnowledgeBalance(summaryData: TpqiSummaryStats): {
    overallBalance: "skill-heavy" | "knowledge-heavy" | "balanced";
    recommendedFocus: "skills" | "knowledge" | "maintain-balance";
    balanceScore: number;
  } {
    const skillAvg = summaryData.averageSkillPercent;
    const knowledgeAvg = summaryData.averageKnowledgePercent;
    const difference = knowledgeAvg - skillAvg;
    const balanceScore = Math.round(difference * 100) / 100;

    let overallBalance: "skill-heavy" | "knowledge-heavy" | "balanced";
    let recommendedFocus: "skills" | "knowledge" | "maintain-balance";

    if (Math.abs(difference) <= 5) {
      overallBalance = "balanced";
      recommendedFocus = "maintain-balance";
    } else if (difference > 5) {
      overallBalance = "knowledge-heavy";
      recommendedFocus = "skills";
    } else {
      overallBalance = "skill-heavy";
      recommendedFocus = "knowledge";
    }

    return {
      overallBalance,
      recommendedFocus,
      balanceScore,
    };
  }
}
