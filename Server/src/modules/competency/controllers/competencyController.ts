import { Request, Response } from "express";
import { CompetencyBackendService } from "../services/competencyService";
import { CompetencySearchDto, GetCompetencyDetailDto, SaveEvidenceDto, DeleteEvidenceDto } from "../services/competencyService";
const competencyService = new CompetencyBackendService();

export const CompetencyController = {
  /**
   * GET /api/competency/search?q=keyword
   * ค้นหาอาชีพหรือทักษะจาก TPQI และ SFIA
   */
  search: async (req: Request, res: Response) => {
    try {
      const keyword = req.query.q as string;

      if (!keyword) {
        return res.status(400).json({ error: "Keyword is required" });
      }

      const dto: CompetencySearchDto = { keyword };
      const results = await competencyService.searchCompetencies(dto);

      return res.json(results);
    } catch (error) {
      console.error("[CompetencyController] Search Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * GET /api/competency/detail?source=TPQI&id=1&level=4
   * ดึงรายละเอียดและสถานะการส่งงานของ User
   */
  getDetail: async (req: Request, res: Response) => {
    try {
      const { source, id, level } = req.query;
      const userId = (req as any).user?.userId;

      if (!source || !id || !level) {
        return res.status(400).json({ error: "Missing required fields (source, id, level)" });
      }

      const dto: GetCompetencyDetailDto = {
        userId: userId,
        source: source as "TPQI" | "SFIA",
        id: id as string,
        level: Number(level),
      };

      const detail = await competencyService.getCompetencyDetail(dto);

      if (!detail) {
        return res.status(404).json({ error: "Competency not found" });
      }

      return res.json(detail);
    } catch (error) {
      console.error("[CompetencyController] Get Detail Error:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },

  /**
   * POST /api/competency/evidence
   * บันทึกหลักฐาน (Evidence Link)
   * Body: { source, itemId, url }
   */
  saveEvidence: async (req: Request, res: Response) => {
    try {
      const { source, itemId, url } = req.body;

      // [UPDATE] ดึง userId จริง
      const userId = (req as any).user?.userId;

      // [SECURITY] ต้อง Login ก่อนถึงจะบันทึกได้
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: กรุณาเข้าสู่ระบบก่อนบันทึกข้อมูล" });
      }

      if (!source || !itemId || url === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const dto: SaveEvidenceDto = {
        userId: userId as string,
        source: source as "TPQI" | "SFIA",
        itemId: Number(itemId),
        url: url as string,
      };

      const result = await competencyService.saveEvidence(dto);

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("[CompetencyController] Save Evidence Error:", error);
      return res.status(500).json({ error: "Failed to save evidence" });
    }
  },

  /**
   * DELETE /api/competency/evidence
   * ลบหลักฐาน
   * Body: { source, itemId }
   */
  deleteEvidence: async (req: Request, res: Response) => {
    try {
      const { source, itemId } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: กรุณาเข้าสู่ระบบก่อนลบข้อมูล" });
      }

      if (!source || !itemId) {
        return res.status(400).json({ error: "Missing required fields (source, itemId)" });
      }

      const dto: DeleteEvidenceDto = {
        userId: userId as string,
        source: source as "TPQI" | "SFIA",
        itemId: Number(itemId),
      };

      const result = await competencyService.deleteEvidence(dto);

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("[CompetencyController] Delete Evidence Error:", error);
      return res.status(500).json({ error: "Failed to delete evidence" });
    }
  },
};
