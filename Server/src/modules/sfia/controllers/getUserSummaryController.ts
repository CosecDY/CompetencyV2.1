import { Response, NextFunction } from "express";
import { getUserSummaryByUserId } from "../services/getUserSummaryServices";
import { AuthenticatedRequest } from "../../../middlewares/authMiddleware";

/**
 * Controller to get user summary data for the authenticated user.
 * Returns all skill summaries with statistical information.
 *
 */
export const getUserSummaryController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    // Use the authenticated user's ID
    const summaryData = await getUserSummaryByUserId(req.user.userId);

    if (!summaryData) {
      res.status(404).json({
        success: false,
        message: "No skill summaries found for the user.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: summaryData,
    });
  } catch (error: any) {
    console.error("Error in getUserSummaryController:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Handle specific service errors
    if (error.message?.includes("Failed to fetch summary")) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user summary data.",
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};
