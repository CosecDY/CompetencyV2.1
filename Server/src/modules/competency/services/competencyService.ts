import { prismaSfia, prismaTpqi, prismaCompetency } from "@/db/prismaClients";

// --- Interfaces ---
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
  type?: "SKILL" | "KNOWLEDGE";
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
  tpqiType?: "SKILL" | "KNOWLEDGE";
}

export interface DeleteEvidenceDto {
  userId: string;
  source: "TPQI" | "SFIA";
  itemId: number;
  tpqiType?: "SKILL" | "KNOWLEDGE";
}

export class CompetencyBackendService {
  // ----------------------------------------------------------------------
  // [SEARCH]
  // ----------------------------------------------------------------------
  async searchCompetencies(dto: CompetencySearchDto): Promise<SearchResultItem[]> {
    const { keyword } = dto;
    try {
      const [tpqiResults, sfiaResults] = await Promise.all([
        prismaTpqi.career.findMany({
          where: { name: { contains: keyword } },
          include: {
            careerLevels: {
              include: { level: true, careerLevelDetails: { take: 1 } },
            },
          },
          take: 10,
        }),
        prismaSfia.skill.findMany({
          where: { OR: [{ name: { contains: keyword } }, { code: { contains: keyword } }] },
          include: { category: true, levels: true },
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

  // ----------------------------------------------------------------------
  // [GET DETAIL]
  // ----------------------------------------------------------------------
  async getCompetencyDetail(dto: GetCompetencyDetailDto): Promise<CompetencyDetailResponse | null> {
    const { userId, source, id, level } = dto;
    if (source === "TPQI") {
      return await this._getTpqiDetail(userId, Number(id), level);
    } else {
      return await this._getSfiaDetail(userId, String(id), level);
    }
  }

  // ----------------------------------------------------------------------
  // [SAVE EVIDENCE] **Main Logic**
  // ----------------------------------------------------------------------
  async saveEvidence(dto: SaveEvidenceDto) {
    // 1. เช็ค URL ว่าเข้าถึงได้จริงไหม
    await this._checkUrlReachability(dto.url);

    // 2. เช็ค Foreign Key ว่า User/Item มีอยู่จริงไหม
    await this._validateEvidenceRequest(dto);

    let result;
    if (dto.source === "TPQI") {
      if (dto.tpqiType === "KNOWLEDGE") {
        result = await this._saveTpqiKnowledgeEvidence(dto);
      } else {
        result = await this._saveTpqiSkillEvidence(dto);
      }
      // Sync TPQI Summary (คำนวณ %)
      await this._syncTpqiSummary(dto.userId, dto.itemId, dto.tpqiType);
    } else {
      result = await this._saveSfiaEvidence(dto);
      // Sync SFIA Summary (คำนวณ %)
      await this._syncSfiaSummary(dto.userId, dto.itemId);
    }
    return result;
  }

  // ----------------------------------------------------------------------
  // [DELETE EVIDENCE]
  // ----------------------------------------------------------------------
  async deleteEvidence(dto: DeleteEvidenceDto) {
    let result;
    if (dto.source === "TPQI") {
      result = await this._deleteTpqiEvidence(dto);
      await this._syncTpqiSummary(dto.userId, dto.itemId, dto.tpqiType);
    } else {
      result = await this._deleteSfiaEvidence(dto);
      await this._syncSfiaSummary(dto.userId, dto.itemId);
    }
    return result;
  }

  // ======================================================================
  // PRIVATE HELPER FUNCTIONS
  // ======================================================================

  /**
   * ตรวจสอบว่า URL สามารถเข้าถึงได้จริง (Return 200-299)
   */
  private async _checkUrlReachability(url: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      // ใช้ HEAD ก่อนเพื่อความเร็ว ถ้าไม่ได้ค่อยใช้ GET
      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // บาง Server ไม่รองรับ HEAD อาจจะตอบ 405 หรือ 404 หลอกๆ ลอง GET อีกทีเพื่อความชัวร์
        if (response.status === 405 || response.status === 404) {
          const controller2 = new AbortController();
          const timeoutId2 = setTimeout(() => controller2.abort(), 5000);
          const responseGet = await fetch(url, { method: "GET", signal: controller2.signal });
          clearTimeout(timeoutId2);
          if (!responseGet.ok) throw new Error("Unreachable");
        } else {
          throw new Error("Unreachable");
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        throw new Error("URL validation timed out. Please check your link.");
      }
    }
  }

  /**
   * ตรวจสอบความถูกต้องของข้อมูล (Foreign Key Checks)
   */
  private async _validateEvidenceRequest(dto: SaveEvidenceDto): Promise<void> {
    // 1. Check User
    const user = await prismaCompetency.user.findUnique({ where: { id: dto.userId } });
    if (!user) throw new Error(`User ID ${dto.userId} not found.`);

    // 2. Check Item ID
    if (dto.source === "TPQI") {
      if (dto.tpqiType === "KNOWLEDGE") {
        const knowledge = await prismaTpqi.knowledge.findUnique({ where: { id: dto.itemId } });
        if (!knowledge) throw new Error(`TPQI Knowledge ID ${dto.itemId} not found.`);
      } else {
        const skill = await prismaTpqi.skill.findUnique({ where: { id: dto.itemId } });
        if (!skill) throw new Error(`TPQI Skill ID ${dto.itemId} not found.`);
      }
    } else if (dto.source === "SFIA") {
      const subSkill = await prismaSfia.subSkill.findUnique({ where: { id: dto.itemId } });
      if (!subSkill) throw new Error(`SFIA SubSkill ID ${dto.itemId} not found.`);
    }
  }

  // --- SAVE FUNCTIONS (Internal) ---
  private async _saveTpqiSkillEvidence(dto: SaveEvidenceDto) {
    const where = { userId: dto.userId, skillId: dto.itemId };
    const existing = await prismaTpqi.userSkill.findFirst({ where });
    if (existing) {
      return await prismaTpqi.userSkill.update({
        where: { id: existing.id },
        data: { evidenceUrl: dto.url, approvalStatus: "PENDING" },
      });
    }
    return await prismaTpqi.userSkill.create({
      data: { userId: dto.userId, skillId: dto.itemId, evidenceUrl: dto.url, approvalStatus: "PENDING" },
    });
  }

  private async _saveTpqiKnowledgeEvidence(dto: SaveEvidenceDto) {
    const where = { userId: dto.userId, knowledgeId: dto.itemId };
    const existing = await prismaTpqi.userKnowledge.findFirst({ where });
    if (existing) {
      return await prismaTpqi.userKnowledge.update({
        where: { id: existing.id },
        data: { evidenceUrl: dto.url, approvalStatus: "PENDING" },
      });
    }
    return await prismaTpqi.userKnowledge.create({
      data: { userId: dto.userId, knowledgeId: dto.itemId, evidenceUrl: dto.url, approvalStatus: "PENDING" },
    });
  }

  private async _saveSfiaEvidence(dto: SaveEvidenceDto) {
    const where = { userId: dto.userId, subSkillId: dto.itemId };
    const existing = await prismaSfia.information.findFirst({ where });
    if (existing) {
      return await prismaSfia.information.update({
        where: { id: existing.id },
        data: { evidenceUrl: dto.url, approvalStatus: "PENDING" },
      });
    }
    return await prismaSfia.information.create({
      data: { userId: dto.userId, subSkillId: dto.itemId, text: "", evidenceUrl: dto.url, approvalStatus: "PENDING" },
    });
  }

  // --- DELETE FUNCTIONS (Internal) ---
  private async _deleteTpqiEvidence(dto: DeleteEvidenceDto) {
    if (dto.tpqiType === "KNOWLEDGE") {
      return await prismaTpqi.userKnowledge.deleteMany({ where: { userId: dto.userId, knowledgeId: dto.itemId } });
    }
    return await prismaTpqi.userSkill.deleteMany({ where: { userId: dto.userId, skillId: dto.itemId } });
  }

  private async _deleteSfiaEvidence(dto: DeleteEvidenceDto) {
    return await prismaSfia.information.deleteMany({ where: { userId: dto.userId, subSkillId: dto.itemId } });
  }

  // --- GET DETAIL FUNCTIONS (Internal) ---
  private async _getTpqiDetail(userId: string, careerId: number, levelNum: number): Promise<CompetencyDetailResponse | null> {
    // 1. หา Level ID
    const levelObj = await prismaTpqi.level.findFirst({ where: { name: String(levelNum) } });
    if (!levelObj) return null;

    // 2. Query ข้อมูลจาก DB
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
                userSkills: { where: { userId: userId || "" } },
              },
            },
          },
        },
        careerLevelKnowledge: {
          include: {
            knowledge: {
              include: {
                userKnowledge: { where: { userId: userId || "" } },
              },
            },
          },
        },
      },
    });

    if (!data) return null;

    // 3. Map Data (SKILL)
    const skillItems: EvidenceItem[] = data.careerLevelSkills.map((cls) => {
      const userEvidence = cls.skill.userSkills[0];

      return {
        itemId: cls.skill.id,
        type: "SKILL",
        text: `(ทักษะ) ${cls.skill.name}`,
        description: "",
        evidenceUrl: userEvidence?.evidenceUrl || null,
        status: userEvidence ? (userEvidence.approvalStatus as any) : "EMPTY",
      };
    });

    // 4. Map Data (KNOWLEDGE)
    const knowledgeItems: EvidenceItem[] = data.careerLevelKnowledge.map((clk) => {
      const userEvidence = clk.knowledge.userKnowledge[0];

      return {
        itemId: clk.knowledge.id,
        type: "KNOWLEDGE",
        text: `(ความรู้) ${clk.knowledge.name}`,
        description: "",
        evidenceUrl: userEvidence?.evidenceUrl || null,
        status: userEvidence ? (userEvidence.approvalStatus as any) : "EMPTY",
      };
    });

    // 5. รวมรายการ และ [สำคัญ] กรองข้อมูลซ้ำออก (Deduplicate)
    const allItems = [...skillItems, ...knowledgeItems];
    const uniqueItems = Array.from(new Map(allItems.map((item) => [`${item.type}-${item.itemId}`, item])).values());

    return {
      source: "TPQI",
      id: careerId,
      title: data.career.name,
      level: levelNum,
      category: "TPQI Standard",
      description: data.careerLevelDetails[0]?.description || "",
      items: uniqueItems,
    };
  }

  private async _getSfiaDetail(userId: string, skillCode: string, levelNum: number): Promise<CompetencyDetailResponse | null> {
    const data = await prismaSfia.skill.findUnique({
      where: { code: skillCode },
      include: {
        category: true,
        levels: {
          where: { name: String(levelNum) },
          include: {
            descriptions: {
              include: {
                subSkills: {
                  include: {
                    informations: {
                      where: { userId: userId || "" },
                    },
                  },
                },
              },
            },
          },
        },
      },
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
          status: userEvidence ? (userEvidence.approvalStatus as any) : "EMPTY",
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

  // --- SYNC SUMMARY FUNCTIONS ---
  private async _syncTpqiSummary(userId: string, itemId: number, type: "SKILL" | "KNOWLEDGE" = "SKILL") {
    try {
      let careerLevelId: number | null = null;
      if (type === "KNOWLEDGE") {
        const knwRel = await prismaTpqi.careerLevelKnowledge.findFirst({
          where: { knowledgeId: itemId },
          select: { careerLevelId: true },
        });
        careerLevelId = knwRel?.careerLevelId || null;
      } else {
        const skillRel = await prismaTpqi.careerLevelSkill.findFirst({
          where: { skillId: itemId },
          select: { careerLevelId: true },
        });
        careerLevelId = skillRel?.careerLevelId || null;
      }

      if (!careerLevelId) return;

      const careerLevelInfo = await prismaTpqi.careerLevel.findUnique({
        where: { id: careerLevelId },
        select: { careerId: true, levelId: true },
      });
      if (!careerLevelInfo) return;

      const user = await prismaCompetency.user.findUnique({ where: { id: userId }, select: { email: true } });
      const userEmail = user?.email || "unknown@mail.com";

      // นับเฉพาะที่ APPROVED แล้วเท่านั้น
      const [totalSkills, userSkills, totalKnw, userKnw] = await Promise.all([
        prismaTpqi.careerLevelSkill.count({ where: { careerLevelId } }),
        prismaTpqi.userSkill.count({
          where: {
            userId,
            approvalStatus: "APPROVED", // <--- [TPQI Check]
            skill: { careerLevelSkills: { some: { careerLevelId } } },
          },
        }),
        prismaTpqi.careerLevelKnowledge.count({ where: { careerLevelId } }),
        prismaTpqi.userKnowledge.count({
          where: {
            userId,
            approvalStatus: "APPROVED", // <--- [TPQI Check]
            knowledge: { careerLevelKnowledge: { some: { careerLevelId } } },
          },
        }),
      ]);

      const skillPercent = totalSkills > 0 ? (userSkills / totalSkills) * 100 : 0;
      const knowledgePercent = totalKnw > 0 ? (userKnw / totalKnw) * 100 : 0;

      await prismaTpqi.tpqiSummary.upsert({
        where: { userEmail_careerLevelId: { userEmail: userEmail, careerLevelId: careerLevelId } },
        create: {
          userEmail: userEmail,
          careerId: careerLevelInfo.careerId,
          levelId: careerLevelInfo.levelId,
          careerLevelId: careerLevelId,
          skillPercent: skillPercent,
          knowledgePercent: knowledgePercent,
        },
        update: { skillPercent: skillPercent, knowledgePercent: knowledgePercent },
      });
    } catch (error) {
      console.error("[Sync TPQI] Error:", error);
    }
  }

  private async _syncSfiaSummary(userId: string, subSkillId: number) {
    try {
      const subSkillData = await prismaSfia.subSkill.findUnique({
        where: { id: subSkillId },
        include: { description: { include: { level: true } } },
      });

      if (!subSkillData || !subSkillData.description || !subSkillData.description.level) return;

      const levelId = subSkillData.description.levelId;
      const skillCode = subSkillData.description.level.skillCode;
      if (!levelId || !skillCode) return;

      const totalSubSkills = await prismaSfia.subSkill.count({
        where: { description: { levelId: levelId } },
      });

      const userDone = await prismaSfia.information.count({
        where: {
          userId,
          approvalStatus: "APPROVED",
          subSkill: { description: { levelId: levelId } },
        },
      });

      const percent = totalSubSkills > 0 ? (userDone / totalSubSkills) * 100 : 0;

      const existingSummary = await prismaSfia.sfiaSummary.findFirst({
        where: { userId, skillCode, levelId },
      });

      if (existingSummary) {
        await prismaSfia.sfiaSummary.update({
          where: { id: existingSummary.id },
          data: { skillPercent: percent },
        });
      } else {
        await prismaSfia.sfiaSummary.create({
          data: { userId, skillCode, levelId, skillPercent: percent },
        });
      }
    } catch (error) {
      console.error("SFIA Sync Failed:", error);
    }
  }
}
