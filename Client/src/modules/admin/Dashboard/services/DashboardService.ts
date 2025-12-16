import api from "@Services/api";

export interface RecentUser {
  id: string;
  email: string;
  firstNameTH?: string;
  lastNameTH?: string;
  status: "online" | "offline";
  lastLogin?: string;
}

export interface TopSfiaSkill {
  skillCode: string;
  skillName?: string;
  averagePercent: number;
}

export interface TopTpqiCareer {
  careerName?: string;
  avgSkillPercent: number;
  avgKnowledgePercent: number;
}

export interface DashboardSummary {
  totalUsers: number;
  onlineUsers: number;
  rolesCount: Record<string, number>;
  recentUsers: RecentUser[];
  topSfiaSkills: TopSfiaSkill[];
  topTpqiCareers: TopTpqiCareer[];
}

export const DashboardService = {
  getSummary: async (): Promise<DashboardSummary> => {
    try {
      const { data } = await api.get<DashboardSummary>("/admin/dashboard");
      return data;
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      throw error;
    }
  },
};
