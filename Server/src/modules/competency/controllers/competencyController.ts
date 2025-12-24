import { Request, Response } from "express";
import { CompetencyBackendService } from "../services/competencyService";
import { CompetencySearchDto, GetCompetencyDetailDto, SaveEvidenceDto, DeleteEvidenceDto } from "../services/competencyService";
import { AuthenticatedRequest } from "@Middlewares/authMiddleware";

const competencyService = new CompetencyBackendService();

export const CompetencyController = {
  /**
   * GET /api/competency/search?q=keyword
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
   */
  getDetail: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { source, id, level } = req.query;
      const userId = req.user?.userId || "";
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }
      if (!source || !id || !level) {
        console.warn("[Controller] Missing fields - sending 400");
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
        console.warn("[Controller] Competency Detail not found - sending 404");
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
   * [UPDATED] รับ tpqiType เพิ่ม
   */
  saveEvidence: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { source, itemId, url, tpqiType } = req.body;
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }
      const userId = req.user.userId;

      if (!source || !itemId || url === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const dto: SaveEvidenceDto = {
        userId: userId,
        source: source as "TPQI" | "SFIA",
        itemId: Number(itemId),
        url: url as string,
        tpqiType: tpqiType as "SKILL" | "KNOWLEDGE" | undefined,
      };

      const result = await competencyService.saveEvidence(dto);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      console.error("[CompetencyController] Save Evidence Error:", error.message);
      return res.status(400).json({ error: error.message || "Failed to save evidence" });
    }
  },

  /**
   * DELETE /api/competency/evidence
   * [UPDATED] รับ tpqiType เพิ่ม
   */
  deleteEvidence: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { source, itemId, tpqiType } = req.body;
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }
      const userId = req.user.userId;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized: กรุณาเข้าสู่ระบบก่อนลบข้อมูล" });
      }

      if (!source || !itemId) {
        return res.status(400).json({ error: "Missing required fields (source, itemId)" });
      }

      const dto: DeleteEvidenceDto = {
        userId: userId,
        source: source as "TPQI" | "SFIA",
        itemId: Number(itemId),
        tpqiType: tpqiType as "SKILL" | "KNOWLEDGE" | undefined,
      };

      const result = await competencyService.deleteEvidence(dto);

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error("[CompetencyController] Delete Evidence Error:", error);
      return res.status(500).json({ error: "Failed to delete evidence" });
    }
  },
};
