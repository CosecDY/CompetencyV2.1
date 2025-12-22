import { prismaSfia, prismaTpqi } from "@/db/prismaClients";

export interface CompetencySearchDto {
  keyword: string;
}

export interface SearchResultItem {
  id: string | number;
  source: "TPQI" | "SFIA";
  title: string;
  code?: string;
  category: string;
  description: string;
  availableLevels: number[];
}

export interface GetCompetencyDetailDto {
  userId: string;
  source: "TPQI" | "SFIA";
  id: string | number;
  level: number;
}

export interface EvidenceItem {
  itemId: number;
  text: string;
  description?: string;
  evidenceUrl: string | null;
  status: "APPROVED" | "PENDING" | "EMPTY" | "REJECTED";
}

export interface CompetencyDetailResponse {
  source: "TPQI" | "SFIA";
  id: string | number;
  title: string;
  level: number;
  category: string;
  description: string;
  items: EvidenceItem[];
}

export interface SaveEvidenceDto {
  userId: string;
  source: "TPQI" | "SFIA";
  itemId: number;
  url: string;
}

export interface DeleteEvidenceDto {
  userId: string;
  source: "TPQI" | "SFIA";
  itemId: number;
}

export class CompetencyBackendService {
  async searchCompetencies(dto: CompetencySearchDto): Promise<SearchResultItem[]> {
    const { keyword } = dto;

    try {
      const [tpqiResults, sfiaResults] = await Promise.all([
        prismaTpqi.career.findMany({
          where: { name: { contains: keyword } },
          include: {
            careerLevels: {
              include: {
                level: true,
                careerLevelDetails: { take: 1 },
              },
            },
          },
          take: 10,
        }),
        prismaSfia.skill.findMany({
          where: {
            OR: [{ name: { contains: keyword } }, { code: { contains: keyword } }],
          },
          include: {
            category: true,
            levels: true,
          },
          take: 10,
        }),
      ]);

      const results: SearchResultItem[] = [];

      tpqiResults.forEach((c) => {
        const levels = c.careerLevels
          .map((cl) => parseInt(cl.level.name))
          .filter((l) => !isNaN(l))
          .sort((a, b) => a - b);

        const desc = c.careerLevels[0]?.careerLevelDetails[0]?.description || "";

        results.push({
          id: c.id,
          source: "TPQI",
          title: c.name,
          category: "มาตรฐานอาชีพ TPQI",
          description: desc.length > 100 ? desc.substring(0, 100) + "..." : desc,
          availableLevels: [...new Set(levels)],
        });
      });

      sfiaResults.forEach((s) => {
        const levels = s.levels
          .map((l) => parseInt(l.name || "0"))
          .filter((l) => l > 0)
          .sort((a, b) => a - b);

        results.push({
          id: s.code,
          source: "SFIA",
          title: `${s.code} - ${s.name}`,
          code: s.code,
          category: s.category?.name || "SFIA Skill",
          description: s.overview ? (s.overview.length > 100 ? s.overview.substring(0, 100) + "..." : s.overview) : "",
          availableLevels: levels,
        });
      });

      return results;
    } catch (error) {
      console.error("Search Error:", error);
      throw new Error("Failed to search competencies");
    }
  }

  async getCompetencyDetail(dto: GetCompetencyDetailDto): Promise<CompetencyDetailResponse | null> {
    const { userId, source, id, level } = dto;

    if (source === "TPQI") {
      return await this._getTpqiDetail(userId, Number(id), level);
    } else {
      return await this._getSfiaDetail(userId, String(id), level);
    }
  }

  async saveEvidence(dto: SaveEvidenceDto) {
    let result;
    if (dto.source === "TPQI") {
      result = await this._saveTpqiEvidence(dto);
      await this._syncTpqiSummary(dto.userId, dto.itemId);
    } else {
      result = await this._saveSfiaEvidence(dto);
      await this._syncSfiaSummary(dto.userId, dto.itemId);
    }
    return result;
  }

  async deleteEvidence(dto: DeleteEvidenceDto) {
    let result;
    if (dto.source === "TPQI") {
      result = await this._deleteTpqiEvidence(dto);
      await this._syncTpqiSummary(dto.userId, dto.itemId);
    } else {
      result = await this._deleteSfiaEvidence(dto);
      await this._syncSfiaSummary(dto.userId, dto.itemId);
    }
    return result;
  }

  private async _getTpqiDetail(userId: string, careerId: number, levelNum: number): Promise<CompetencyDetailResponse | null> {
    const levelObj = await prismaTpqi.level.findFirst({ where: { name: String(levelNum) } });
    if (!levelObj) return null;

    const data = await prismaTpqi.careerLevel.findFirst({
      where: {
        careerId: careerId,
        levelId: levelObj.id,
      },
      include: {
        career: true,
        careerLevelDetails: true,
        careerLevelSkills: {
          include: {
            skill: {
              include: {
                userSkills: {
                  where: { userId: userId },
                },
              },
            },
          },
        },
      },
    });

    if (!data) return null;

    const items: EvidenceItem[] = data.careerLevelSkills.map((cls) => {
      const userEvidence = cls.skill.userSkills[0];
      return {
        itemId: cls.skill.id,
        text: cls.skill.name,
        description: "",
        evidenceUrl: userEvidence?.evidenceUrl || null,
        status: userEvidence ? (userEvidence.approvalStatus as any) : "EMPTY",
      };
    });

    return {
      source: "TPQI",
      id: careerId,
      title: data.career.name,
      level: levelNum,
      category: "TPQI Standard",
      description: data.careerLevelDetails[0]?.description || "",
      items,
    };
  }

  private async _getSfiaDetail(userId: string, skillCode: string, levelNum: number): Promise<CompetencyDetailResponse | null> {
    const data = await prismaSfia.skill.findUnique({
      where: { code: skillCode },
      include: { category: true, levels: { where: { name: String(levelNum) }, include: { descriptions: { include: { subSkills: { include: { informations: { where: { userId: userId } } } } } } } } },
    });

    if (!data || data.levels.length === 0) return null;

    const levelData = data.levels[0];
    const mainDesc = levelData.descriptions[0];

    const items: EvidenceItem[] = [];

    levelData.descriptions.forEach((desc) => {
      desc.subSkills.forEach((sub) => {
        const userEvidence = sub.informations[0];
        items.push({
          itemId: sub.id,
          text: sub.text || "",
          description: "",
          evidenceUrl: userEvidence?.evidenceUrl || null,
          status: userEvidence ? (userEvidence.approvalStatus === "APPROVED" ? "APPROVED" : "PENDING") : "EMPTY",
        });
      });
    });

    return {
      source: "SFIA",
      id: skillCode,
      title: `${data.code} - ${data.name}`,
      level: levelNum,
      category: data.category?.name || "",
      description: mainDesc?.text || data.overview || "",
      items,
    };
  }

  private async _saveTpqiEvidence(dto: SaveEvidenceDto) {
    const existing = await prismaTpqi.userSkill.findFirst({ where: { userId: dto.userId, skillId: dto.itemId } });

    if (existing) {
      return await prismaTpqi.userSkill.update({
        where: { id: existing.id },
        data: { evidenceUrl: dto.url, approvalStatus: "NOT_APPROVED" },
      });
    } else {
      return await prismaTpqi.userSkill.create({
        data: {
          userId: dto.userId,
          skillId: dto.itemId,
          evidenceUrl: dto.url,
          approvalStatus: "NOT_APPROVED",
        },
      });
    }
  }

  private async _saveSfiaEvidence(dto: SaveEvidenceDto) {
    const existing = await prismaSfia.information.findFirst({ where: { userId: dto.userId, subSkillId: dto.itemId } });

    if (existing) {
      return await prismaSfia.information.update({
        where: { id: existing.id },
        data: { evidenceUrl: dto.url, approvalStatus: "NOT_APPROVED" },
      });
    } else {
      return await prismaSfia.information.create({
        data: {
          userId: dto.userId,
          subSkillId: dto.itemId,
          text: "",
          evidenceUrl: dto.url,
          approvalStatus: "NOT_APPROVED",
        },
      });
    }
  }

  private async _deleteTpqiEvidence(dto: DeleteEvidenceDto) {
    return await prismaTpqi.userSkill.deleteMany({ where: { userId: dto.userId, skillId: dto.itemId } });
  }

  private async _deleteSfiaEvidence(dto: DeleteEvidenceDto) {
    return await prismaSfia.information.deleteMany({ where: { userId: dto.userId, subSkillId: dto.itemId } });
  }

  private async _syncTpqiSummary(userId: string, itemId: number) {
    try {
      let careerLevelId: number | null = null;

      const skillRel = await prismaTpqi.careerLevelSkill.findFirst({
        where: { skillId: itemId },
        select: { careerLevelId: true },
      });

      if (skillRel) {
        careerLevelId = skillRel.careerLevelId;
      } else {
        const knwRel = await prismaTpqi.careerLevelKnowledge.findFirst({
          where: { knowledgeId: itemId },
          select: { careerLevelId: true },
        });
        if (knwRel) careerLevelId = knwRel.careerLevelId;
      }

      if (!careerLevelId) return;

      const careerLevelInfo = await prismaTpqi.careerLevel.findUnique({
        where: { id: careerLevelId },
        select: { careerId: true, levelId: true },
      });

      if (!careerLevelInfo) return;

      const totalSkills = await prismaTpqi.careerLevelSkill.count({
        where: { careerLevelId },
      });

      const userSkills = await prismaTpqi.userSkill.count({
        where: {
          userId,
          evidenceUrl: { not: null },
          skill: { careerLevelSkills: { some: { careerLevelId } } },
        },
      });

      const skillPercent = totalSkills > 0 ? (userSkills / totalSkills) * 100 : 0;

      const totalKnw = await prismaTpqi.careerLevelKnowledge.count({
        where: { careerLevelId },
      });

      const userKnw = await prismaTpqi.userKnowledge.count({
        where: {
          userId,
          evidenceUrl: { not: null },
          knowledge: { careerLevelKnowledge: { some: { careerLevelId } } },
        },
      });

      const knwPercent = totalKnw > 0 ? (userKnw / totalKnw) * 100 : 0;

      const users: any[] = await prismaTpqi.$queryRaw`SELECT email FROM competency.user WHERE id = ${userId}`;
      const userEmail = users.length > 0 ? users[0].email : "unknown@mail.com";

      await prismaTpqi.tpqiSummary.upsert({
        where: {
          userEmail_careerLevelId: { userEmail: userEmail, careerLevelId },
        },
        create: {
          userEmail: userEmail,
          careerId: careerLevelInfo.careerId,
          levelId: careerLevelInfo.levelId,
          careerLevelId,
          skillPercent,
          knowledgePercent: knwPercent,
        },
        update: {
          skillPercent,
          knowledgePercent: knwPercent,
        },
      });
    } catch (error) {
      console.error("TPQI Sync Failed:", error);
    }
  }

  private async _syncSfiaSummary(userId: string, subSkillId: number) {
    try {
      const subSkillData = await prismaSfia.subSkill.findUnique({ where: { id: subSkillId }, include: { description: { include: { level: true } } } });

      if (!subSkillData || !subSkillData.description || !subSkillData.description.level) return;

      const levelId = subSkillData.description.levelId;
      const skillCode = subSkillData.description.level.skillCode;

      if (!levelId || !skillCode) return;

      const totalSubSkills = await prismaSfia.subSkill.count({
        where: {
          description: { levelId: levelId },
        },
      });

      const userDone = await prismaSfia.information.count({
        where: {
          userId,
          evidenceUrl: { not: null },
          subSkill: { description: { levelId: levelId } },
        },
      });

      const percent = totalSubSkills > 0 ? (userDone / totalSubSkills) * 100 : 0;

      const existingSummary = await prismaSfia.sfiaSummary.findFirst({
        where: {
          userId,
          skillCode,
          levelId,
        },
      });

      if (existingSummary) {
        await prismaSfia.sfiaSummary.update({
          where: { id: existingSummary.id },
          data: { skillPercent: percent },
        });
      } else {
        await prismaSfia.sfiaSummary.create({
          data: {
            userId,
            skillCode,
            levelId,
            skillPercent: percent,
          },
        });
      }
    } catch (error) {
      console.error("SFIA Sync Failed:", error);
    }
  }
}
