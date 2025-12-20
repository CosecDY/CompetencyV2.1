import { prismaCompetency, prismaSfia, prismaTpqi } from "@/db/prismaClients";
import { DataSource, ItemType } from "@prisma/client_competency";

// ==========================================
// Types & Interfaces
// ==========================================

export interface CreatePortfolioDto {
  userId: string;
  name: string;
  description?: string;
  items: {
    sourceType: "SFIA" | "TPQI";
    externalId: string; // SFIA=SkillCode, TPQI=CareerLevelId (or similar)
  }[];
}

// [NEW] Interface for Update
export interface UpdatePortfolioDto {
  name?: string;
  description?: string;
  items?: {
    sourceType: "SFIA" | "TPQI";
    externalId: string;
  }[];
}

export interface SfiaStats {
  totalSkills: number;
  averagePercent: number;
  completedSkills: number;
  skillSummaries: any[];
}

export interface TpqiStats {
  totalCareers: number;
  averageSkillPercent: number;
  averageKnowledgePercent: number;
  completedCareers: number;
  careerSummaries: any[];
}

export interface PortfolioDetailResponse {
  userId: string;
  userEmail: string;
  portfolioInfo: {
    id: string;
    name: string;
    description: string | null;
  };
  sfiaSummary: SfiaStats | null;
  tpqiSummary: TpqiStats | null;
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

export class PortfolioBackendService {
  /**
   * 1. CREATE: สร้าง Portfolio ใหม่
   */
  async createPortfolio(dto: CreatePortfolioDto) {
    return await prismaCompetency.$transaction(async (tx) => {
      const portfolio = await tx.portfolio.create({
        data: {
          userId: dto.userId,
          name: dto.name,
          description: dto.description || "",
          items: {
            create: dto.items.map((item) => ({
              sourceType: item.sourceType as DataSource,
              itemType: ItemType.SUMMARY,
              externalId: item.externalId,
            })),
          },
        },
        include: { items: true },
      });
      return portfolio;
    });
  }

  /**
   * 2. LIST: ดึงรายชื่อ Portfolio ทั้งหมดของ User
   */
  async getUserPortfolios(userId: string) {
    return await prismaCompetency.portfolio.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });
  }

  /**
   * 3. DELETE: ลบ Portfolio
   */
  async deletePortfolio(portfolioId: string) {
    return await prismaCompetency.portfolio.delete({
      where: { id: portfolioId },
    });
  }

  /**
   * 4. GET BY ID: ดึงข้อมูล Portfolio รายเล่ม
   * (พร้อมดึงข้อมูลจริงจาก SFIA/TPQI มากรองและคำนวณใหม่)
   */
  async getPortfolioById(portfolioId: string): Promise<PortfolioDetailResponse | null> {
    // 4.1 ดึง Metadata ของ Portfolio จาก Competency DB
    const portfolio = await prismaCompetency.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        items: true,
        user: { select: { email: true } },
      },
    });

    if (!portfolio) return null;

    const userId = portfolio.userId;
    const userEmail = portfolio.user.email || "";

    // 4.2 ดึงข้อมูล Master Data ทั้งหมด (เรียก Private Methods ด้านล่าง)
    const [sfiaMaster, tpqiMaster] = await Promise.all([this._fetchSfiaMasterData(userId), userEmail ? this._fetchTpqiMasterData(userEmail) : Promise.resolve(null)]);

    // 4.3 แยก ID ที่ User เลือกไว้ใน Portfolio นี้
    const selectedSfiaCodes = new Set(portfolio.items.filter((i) => i.sourceType === "SFIA").map((i) => i.externalId));
    const selectedTpqiIds = new Set(portfolio.items.filter((i) => i.sourceType === "TPQI").map((i) => i.externalId));

    // 4.4 FILTERING & RECALCULATION (SFIA)
    let filteredSfia: SfiaStats | null = null;
    if (sfiaMaster) {
      const filteredSkills = sfiaMaster.skillSummaries.filter((s: any) => selectedSfiaCodes.has(s.skillCode));

      const totalSkills = filteredSkills.length;
      const totalPercent = filteredSkills.reduce((sum: number, s: any) => sum + s.skillPercent, 0);

      filteredSfia = {
        totalSkills,
        completedSkills: filteredSkills.filter((s: any) => s.skillPercent === 100).length,
        averagePercent: totalSkills > 0 ? parseFloat((totalPercent / totalSkills).toFixed(2)) : 0,
        skillSummaries: filteredSkills,
      };
    }

    // 4.5 FILTERING & RECALCULATION (TPQI)
    let filteredTpqi: TpqiStats | null = null;
    if (tpqiMaster) {
      const filteredCareers = tpqiMaster.careerSummaries.filter((c: any) => selectedTpqiIds.has(String(c.careerLevelId)));

      const totalCareers = filteredCareers.length;
      const totalSkill = filteredCareers.reduce((sum: number, c: any) => sum + c.skillPercent, 0);
      const totalKnw = filteredCareers.reduce((sum: number, c: any) => sum + c.knowledgePercent, 0);

      filteredTpqi = {
        totalCareers,
        completedCareers: filteredCareers.filter((c: any) => c.skillPercent === 100 && c.knowledgePercent === 100).length,
        averageSkillPercent: totalCareers > 0 ? parseFloat((totalSkill / totalCareers).toFixed(2)) : 0,
        averageKnowledgePercent: totalCareers > 0 ? parseFloat((totalKnw / totalCareers).toFixed(2)) : 0,
        careerSummaries: filteredCareers,
      };
    }

    // 4.6 รวม Stats ทั้งหมด
    return {
      userId,
      userEmail,
      portfolioInfo: {
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description,
      },
      sfiaSummary: filteredSfia,
      tpqiSummary: filteredTpqi,
      overallStats: {
        totalSfiaSkills: filteredSfia?.totalSkills || 0,
        totalTpqiCareers: filteredTpqi?.totalCareers || 0,
        averageSfiaProgress: filteredSfia?.averagePercent || 0,
        averageTpqiSkillProgress: filteredTpqi?.averageSkillPercent || 0,
        averageTpqiKnowledgeProgress: filteredTpqi?.averageKnowledgePercent || 0,
      },
      lastUpdated: portfolio.updatedAt.toISOString(),
    };
  }

  /**
   * 5. UPDATE: แก้ไข Portfolio Existing
   * - อัปเดตชื่อ/คำอธิบาย
   * - ลบ items เดิมทั้งหมดแล้วสร้างใหม่
   */
  async updatePortfolio(portfolioId: string, dto: UpdatePortfolioDto) {
    return await prismaCompetency.$transaction(async (tx) => {
      const existingPortfolio = await tx.portfolio.findUnique({
        where: { id: portfolioId },
      });

      if (!existingPortfolio) {
        throw new Error(`Portfolio with ID ${portfolioId} not found`);
      }

      const updateData: any = {};
      if (dto.name !== undefined) updateData.name = dto.name;
      if (dto.description !== undefined) updateData.description = dto.description;

      if (dto.items) {
        await tx.portfolioItem.deleteMany({
          where: { portfolioId: portfolioId },
        });

        updateData.items = {
          create: dto.items.map((item) => ({
            sourceType: item.sourceType as DataSource,
            itemType: ItemType.SUMMARY,
            externalId: item.externalId,
          })),
        };
      }

      const updatedPortfolio = await tx.portfolio.update({
        where: { id: portfolioId },
        data: updateData,
        include: { items: true },
      });

      return updatedPortfolio;
    });
  }

  // ==========================================
  // Private Helper Methods (Direct DB Access)
  // ==========================================

  private async _fetchSfiaMasterData(userId: string): Promise<SfiaStats | null> {
    try {
      const summaries = await prismaSfia.sfiaSummary.findMany({
        where: { userId },
        include: {
          skill: { include: { category: true } },
          level: true,
        },
      });

      if (!summaries.length) return null;

      const mappedSkills = summaries.map((item) => ({
        id: item.id,
        skillCode: item.skillCode || "",
        skillName: item.skill?.name || "",
        categoryName: item.skill?.category?.name || "",
        levelId: item.levelId || 0,
        levelName: item.level?.name || "",
        skillPercent: Number(item.skillPercent) || 0,
      }));

      // Calculate initial stats (Master)
      const total = mappedSkills.length;
      const avg = total > 0 ? mappedSkills.reduce((sum, s) => sum + s.skillPercent, 0) / total : 0;

      return {
        totalSkills: total,
        averagePercent: parseFloat(avg.toFixed(2)),
        completedSkills: mappedSkills.filter((s) => s.skillPercent === 100).length,
        skillSummaries: mappedSkills,
      };
    } catch (error) {
      console.error("SFIA DB Error:", error);
      return null;
    }
  }

  /**
   * Helper: ดึงข้อมูล TPQI ทั้งหมดจาก DB
   */
  private async _fetchTpqiMasterData(userEmail: string): Promise<TpqiStats | null> {
    try {
      const summaries = await prismaTpqi.tpqiSummary.findMany({
        where: { userEmail },
        include: {
          Career: true,
          Level: true,
          CareerLevel: true,
        },
      });

      if (!summaries.length) return null;

      const mappedCareers = summaries.map((item) => ({
        id: item.id,
        careerId: item.careerId,
        careerName: item.Career?.name || null,
        levelId: item.levelId,
        levelName: item.Level?.name || null,
        careerLevelId: item.careerLevelId,
        skillPercent: Number(item.skillPercent),
        knowledgePercent: Number(item.knowledgePercent),
      }));

      // Calculate initial stats (Master)
      const total = mappedCareers.length;
      const avgSkill = total > 0 ? mappedCareers.reduce((sum, c) => sum + c.skillPercent, 0) / total : 0;
      const avgKnw = total > 0 ? mappedCareers.reduce((sum, c) => sum + c.knowledgePercent, 0) / total : 0;

      return {
        totalCareers: total,
        averageSkillPercent: parseFloat(avgSkill.toFixed(2)),
        averageKnowledgePercent: parseFloat(avgKnw.toFixed(2)),
        completedCareers: mappedCareers.filter((c) => c.skillPercent === 100 && c.knowledgePercent === 100).length,
        careerSummaries: mappedCareers,
      };
    } catch (error) {
      console.error("TPQI DB Error:", error);
      return null;
    }
  }
}
