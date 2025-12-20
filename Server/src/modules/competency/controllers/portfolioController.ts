import { Request, Response } from "express";
import { PortfolioBackendService } from "../services/portfolioService";

const portfolioService = new PortfolioBackendService();

export const PortfolioController = {
  /**
   * POST /api/portfolio/create
   */
  create: async (req: Request, res: Response) => {
    try {
      const { userId, name, description, items } = req.body;

      // Validation
      if (!userId || !name || !items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields or invalid items format",
        });
      }

      if (items.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Portfolio must contain at least one item",
        });
      }

      // Call Service
      const newPortfolio = await portfolioService.createPortfolio({
        userId,
        name,
        description,
        items,
      });

      return res.status(201).json({
        success: true,
        data: newPortfolio,
        message: "Portfolio created successfully",
      });
    } catch (error: any) {
      console.error("Create Portfolio Error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  },

  /**
   * GET /api/portfolio/:id
   */
  getById: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "Portfolio ID required" });
      }

      const data = await portfolioService.getPortfolioById(id);

      if (!data) {
        return res.status(404).json({ success: false, message: "Portfolio not found" });
      }

      return res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error(`Get Portfolio ${req.params.id} Error:`, error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch portfolio details",
      });
    }
  },

  /**
   * PUT /api/portfolio/:id
   */
  update: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, description, items } = req.body;

      // 1. Validate ID
      if (!id) {
        return res.status(400).json({ success: false, message: "Portfolio ID required" });
      }

      // 2. Validate Items
      if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Items must be a non-empty array",
          });
        }
      }

      // 3. Call Service
      const updatedPortfolio = await portfolioService.updatePortfolio(id, {
        name,
        description,
        items,
      });

      return res.status(200).json({
        success: true,
        data: updatedPortfolio,
        message: "Portfolio updated successfully",
      });
    } catch (error: any) {
      console.error(`Update Portfolio ${req.params.id} Error:`, error);
      if (error.code === "P2025" || error.message?.includes("not found")) {
        return res.status(404).json({
          success: false,
          message: "Portfolio not found",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update portfolio",
      });
    }
  },

  /**
   * DELETE /api/portfolio/:id
   */
  delete: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: "Portfolio ID required" });
      }

      await portfolioService.deletePortfolio(id);

      return res.status(200).json({
        success: true,
        message: "Portfolio deleted successfully",
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        // Prisma Record Not Found Code
        return res.status(404).json({ success: false, message: "Portfolio not found or already deleted" });
      }
      return res.status(500).json({ success: false, message: "Failed to delete portfolio" });
    }
  },

  /**
   * GET /api/portfolio/user/:userId
   */
  getByUser: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID required" });
      }

      const portfolios = await portfolioService.getUserPortfolios(userId);

      return res.status(200).json({
        success: true,
        data: portfolios,
      });
    } catch (error: any) {
      console.error(`List Portfolios Error:`, error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user portfolios",
      });
    }
  },
};
