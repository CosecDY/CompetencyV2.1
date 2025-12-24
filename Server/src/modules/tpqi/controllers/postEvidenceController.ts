import { Response, NextFunction } from "express";
import { URL } from "url";
import { isIP } from "net";
// import {
//   createTpqiEvidence,
//   CreateTpqiEvidenceRequest,
// } from "../services/postEvidenceService";
import { AuthenticatedRequest } from "../../../middlewares/authMiddleware";

/**
 * Validates if a string is a valid URL and safe for external access
 * @param url - The URL string to validate
 * @returns boolean - True if valid and safe URL, false otherwise
 */
const isValidAndSafeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);

    // Only allow HTTP and HTTPS protocols
    if (!["http:", "https:"].includes(urlObj.protocol)) {
      return false;
    }

    // Get hostname
    const hostname = urlObj.hostname.toLowerCase();

    // Block localhost and local addresses
    const blockedHostnames = [
      "localhost",
      "127.0.0.1",
      "0.0.0.0",
      "::1",
      "metadata.google.internal", // GCP metadata
      "169.254.169.254", // AWS/Azure metadata
      "metadata.azure.com", // Azure metadata
      "instance-data", // Some cloud providers
      "metadata", // Generic metadata
    ];

    if (blockedHostnames.includes(hostname)) {
      return false;
    }

    // Block private IP ranges
    if (isIP(hostname)) {
      const ip = hostname;

      // IPv4 private and special ranges
      if (
        ip.startsWith("10.") ||
        ip.startsWith("127.") ||
        ip.startsWith("169.254.") || // Link-local
        ip.startsWith("224.") || // Multicast
        ip.startsWith("240.") || // Reserved
        /^192\.168\./.test(ip) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
        ip === "0.0.0.0" ||
        ip === "255.255.255.255"
      ) {
        return false;
      }

      // IPv6 private ranges
      if (
        ip.startsWith("::1") ||
        ip.startsWith("::") ||
        ip.startsWith("fc00:") ||
        ip.startsWith("fd00:") ||
        ip.startsWith("fe80:") ||
        ip.startsWith("ff00:") // Multicast
      ) {
        return false;
      }
    }

    // Block common internal domain patterns
    const internalPatterns = [/\.local$/, /\.internal$/, /\.corp$/, /\.lan$/, /\.intranet$/, /\.private$/];

    if (internalPatterns.some((pattern) => pattern.test(hostname))) {
      return false;
    }

    // Block URLs with non-standard ports that might be internal services
    const port = urlObj.port;
    if (port) {
      const portNum = parseInt(port, 10);
      // Block common internal service ports
      const blockedPorts = [22, 23, 25, 53, 135, 139, 445, 993, 995, 1433, 1521, 3306, 3389, 5432, 5984, 6379, 8080, 8443, 9200, 9300, 11211, 27017, 50070];
      if (blockedPorts.includes(portNum)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Most secure approach: Format validation only (RECOMMENDED)
 * This eliminates SSRF risk entirely by not making any HTTP requests
 * @param url - The URL string to validate
 * @returns boolean - True if valid and safe URL format, false otherwise
 */
const validateUrlFormatOnly = (url: string): boolean => {
  return isValidAndSafeUrl(url);
};

/**
 * Helper to validate skillId and knowledgeId
 */
function validateSkillOrKnowledge(skillId: any, knowledgeId: any): string | null {
  if (!skillId && !knowledgeId) {
    return "Either skillId or knowledgeId must be provided.";
  }
  if (skillId !== undefined && (!Number.isInteger(skillId) || skillId <= 0)) {
    return "skillId must be a positive integer if provided.";
  }
  if (knowledgeId !== undefined && (!Number.isInteger(knowledgeId) || knowledgeId <= 0)) {
    return "knowledgeId must be a positive integer if provided.";
  }
  return null;
}

/**
 * Helper to validate evidenceUrl using secure format-only validation
 */
function validateEvidenceUrl(evidenceUrl: any): {
  error: string | null;
  value?: string;
} {
  if (evidenceUrl === undefined) return { error: null };

  if (typeof evidenceUrl !== "string") {
    return { error: "evidenceUrl must be a string if provided." };
  }

  const trimmedUrl = evidenceUrl.trim();
  if (trimmedUrl === "") {
    return { error: "evidenceUrl cannot be empty if provided." };
  }

  if (!validateUrlFormatOnly(trimmedUrl)) {
    return {
      error: "Evidence URL must be a valid, publicly accessible HTTP or HTTPS URL.",
    };
  }

  return { error: null, value: trimmedUrl };
}

/**
 * Controller to handle POST /tpqi/evidence
 * Creates new evidence for a user's skill or knowledge in TPQI
 */
// export const postTpqiEvidenceController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     // Use userId from authentication middleware, not from body
//     if (!req.user?.userId) {
//       res.status(401).json({ success: false, message: "Authentication required." });
//       return;
//     }

//     const { skillId, knowledgeId, evidenceUrl } = req.body as Omit<CreateTpqiEvidenceRequest, "userId">;

//     // Validate skillId and knowledgeId
//     const skillOrKnowledgeError = validateSkillOrKnowledge(skillId, knowledgeId);
//     if (skillOrKnowledgeError) {
//       res.status(400).json({ success: false, message: skillOrKnowledgeError });
//       return;
//     }

//     // Validate evidenceUrl if provided using secure format-only validation
//     let validatedEvidenceUrl: string | undefined;
//     const evidenceUrlResult = validateEvidenceUrl(evidenceUrl);
//     if (evidenceUrlResult.error) {
//       res.status(400).json({ success: false, message: evidenceUrlResult.error });
//       return;
//     }
//     validatedEvidenceUrl = evidenceUrlResult.value;

//     // Call service to create evidence
//     const evidence = await createTpqiEvidence({
//       userId: req.user.userId,
//       skillId,
//       knowledgeId,
//       evidenceUrl: validatedEvidenceUrl,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Evidence created successfully.",
//       data: evidence,
//     });
//   } catch (error: any) {
//     console.error("Error in postTpqiEvidenceController:", error);

//     // Handle known service errors
//     if (error.message?.includes("does not exist")) {
//       res.status(404).json({
//         success: false,
//         message: error.message,
//       });
//       return;
//     }

//     // Handle Prisma errors
//     if (error.code === "P2002") {
//       res.status(409).json({
//         success: false,
//         message: "Evidence already exists for this skill or knowledge.",
//       });
//       return;
//     }

//     if (error.code === "P2025") {
//       res.status(404).json({
//         success: false,
//         message: "Related record not found.",
//       });
//       return;
//     }

//     // Handle validation errors
//     if (error.name === "ValidationError") {
//       res.status(400).json({
//         success: false,
//         message: error.message,
//       });
//       return;
//     }

//     // Generic server error
//     res.status(500).json({
//       success: false,
//       message: "Internal server error. Please try again later.",
//     });
//   }
// };
