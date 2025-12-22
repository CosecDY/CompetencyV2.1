import { Request, Response, NextFunction } from "express";
import UserDataService from "../services/getUserData";

// Define the authenticated request type (similar to SFIA module)
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

/**
 * Controller to get current user's profile data.
 */
export const getUserProfileController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const profile = await UserDataService.getUserProfile(req.user.userId);

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error("Error in getUserProfileController:", error);

    // Handle record not found errors
    if (error.code === "P2025" || error.message?.includes("Record to read does not exist")) {
      res.status(404).json({
        success: false,
        message: "User profile not found.",
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

/**
 * Controller to update current user's profile data.
 */
export const updateUserProfileController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { firstNameTH, lastNameTH, firstNameEN, lastNameEN, phone, line, address } = req.body;

    // Validate required fields
    if (!firstNameTH || !lastNameTH || !firstNameEN || !lastNameEN || !phone || !address) {
      res.status(400).json({
        success: false,
        message: "Missing required fields: firstNameTH, lastNameTH, firstNameEN, lastNameEN, phone, address",
      });
      return;
    }

    // Validate field types and lengths
    if (typeof firstNameTH !== "string" || firstNameTH.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "firstNameTH must be a non-empty string.",
      });
      return;
    }

    if (typeof lastNameTH !== "string" || lastNameTH.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "lastNameTH must be a non-empty string.",
      });
      return;
    }

    if (typeof firstNameEN !== "string" || firstNameEN.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "firstNameEN must be a non-empty string.",
      });
      return;
    }

    if (typeof lastNameEN !== "string" || lastNameEN.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "lastNameEN must be a non-empty string.",
      });
      return;
    }

    if (typeof phone !== "string" || phone.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "phone must be a non-empty string.",
      });
      return;
    }

    if (typeof address !== "string" || address.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "address must be a non-empty string.",
      });
      return;
    }

    // Validate phone format
    if (!/^[0-9-+\s()]{10,}$/.test(phone)) {
      res.status(400).json({
        success: false,
        message: "Invalid phone number format. Must be at least 10 characters with numbers, spaces, hyphens, plus signs, or parentheses.",
      });
      return;
    }

    // Validate line ID format if provided
    if (line && (typeof line !== "string" || line.trim().length > 100)) {
      res.status(400).json({
        success: false,
        message: "line must be a string with maximum 100 characters.",
      });
      return;
    }

    const updatedProfile = await UserDataService.updateUserProfile(req.user.userId, {
      firstNameTH: firstNameTH.trim(),
      lastNameTH: lastNameTH.trim(),
      firstNameEN: firstNameEN.trim(),
      lastNameEN: lastNameEN.trim(),
      phone: phone.trim(),
      line: line?.trim() || undefined,
      address: address.trim(),
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: updatedProfile,
    });
  } catch (error: any) {
    console.error("Error in updateUserProfileController:", error);

    // Handle specific service errors
    if (error.message?.includes("does not exist")) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    // Handle record not found errors
    if (error.code === "P2025" || error.message?.includes("Record to update does not exist")) {
      res.status(404).json({
        success: false,
        message: "User profile not found.",
      });
      return;
    }

    // Handle unique constraint violations (unlikely for this use case)
    if (error.code === "P2002") {
      res.status(409).json({
        success: false,
        message: "Profile data conflicts with existing records.",
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

/**
 * Controller to get basic user info (for avatar/display purposes).
 */
export const getUserBasicInfoController = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Validate user authentication
    if (!req.user?.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const basicInfo = await UserDataService.getUserBasicInfo(req.user.userId);

    if (!basicInfo) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: basicInfo,
    });
  } catch (error: any) {
    console.error("Error in getUserBasicInfoController:", error);

    // Handle record not found errors
    if (error.code === "P2025" || error.message?.includes("Record to read does not exist")) {
      res.status(404).json({
        success: false,
        message: "User not found.",
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
