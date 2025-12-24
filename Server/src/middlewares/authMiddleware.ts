import { Request, Response, NextFunction } from "express";
import { PrismaClient, User, AssetInstance, Asset } from "@prisma/client_competency";
import { verifyToken } from "@Utils/tokenUtils";
import { Role } from "./authEnums";

const prisma = new PrismaClient();

// -------------------------------------------------------------------------
// 1. Type Definitions
// -------------------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[]; // เก็บเป็น format "resource:action"
  };
  assetInstance?: AssetInstance & { asset: Asset };
}

// -------------------------------------------------------------------------
// 2. Helper Functions
// -------------------------------------------------------------------------
const fetchUserWithPermissions = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      sessions: {
        where: { expiresAt: { gt: new Date() } },
        take: 1,
      },
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: {
                    select: {
                      asset: { select: { tableName: true } },
                      operation: { select: { name: true } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
};

// -------------------------------------------------------------------------
// 3. Core Middleware: Authenticate
// -------------------------------------------------------------------------
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.cookies?.accessToken;

    if (!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await fetchUserWithPermissions(String(payload.userId));

    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    // Session Activity Update
    if (user.sessions?.length) {
      const latestSession = user.sessions[0];
      const now = new Date();
      const UPDATE_THRESHOLD = 5 * 60 * 1000;
      if (now.getTime() - new Date(latestSession.updatedAt).getTime() > UPDATE_THRESHOLD) {
        prisma.session
          .update({
            where: { id: latestSession.id },
            data: { lastActivityAt: now },
          })
          .catch(console.error);
      }
    }

    // Flatten Permissions -> ["asset:create", "user:read", ...]
    const permissions = user.userRoles.flatMap((ur) => ur.role?.rolePermissions?.map((rp) => `${rp.permission.asset.tableName}:${rp.permission.operation.name}`) || []);

    const roles = user.userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

    (req as AuthenticatedRequest).user = {
      userId: user.id,
      email: user.email,
      roles,
      permissions: Array.from(new Set(permissions)), // Remove duplicates
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err);
    res.status(401).json({ message: "Unauthorized: Server Error" });
  }
};

export const optionalAuthenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.cookies?.accessToken;

    if (!token) return next();

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      return next();
    }

    const user = await fetchUserWithPermissions(String(payload.userId));

    if (user) {
      const permissions = user.userRoles.flatMap((ur) => ur.role?.rolePermissions?.map((rp) => `${rp.permission.asset.tableName}:${rp.permission.operation.name}`) || []);
      const roles = user.userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

      (req as AuthenticatedRequest).user = {
        userId: user.id,
        email: user.email,
        roles,
        permissions: Array.from(new Set(permissions)),
      };
    }
    next();
  } catch (err) {
    next();
  }
};

// -------------------------------------------------------------------------
// 4. Authorization Middlewares (Check Permission)
// -------------------------------------------------------------------------

/**
 * Main Middleware for RBAC
 * ใช้สำหรับตรวจสอบสิทธิ์ตาม Resource และ Action หรือ Role
 * ตัวอย่าง: withAuth({ resource: "Asset", action: "create" })
 */
export const withAuth = (required: { resource?: string; action?: string; roles?: string | string[] }) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // 1. Super Admin Bypass (อนุญาตเสมอ)
    if (user.roles.includes("Admin") || user.roles.includes("SuperAdmin")) {
      return next();
    }

    // 2. Check Roles (ถ้ามีการระบุ roles)
    if (required.roles) {
      const requiredRoles = Array.isArray(required.roles) ? required.roles : [required.roles];
      const hasRole = user.roles.some((r) => requiredRoles.includes(r));
      if (!hasRole) {
        return res.status(403).json({ message: "Forbidden: Insufficient role" });
      }
    }

    // 3. Check Resource Permission (ถ้ามีการระบุ resource และ action)
    // ตรงนี้คือ Logic checkUserPermission ที่ทำงานใน Memory
    if (required.resource && required.action) {
      const permissionKey = `${required.resource}:${required.action}`;

      if (!user.permissions.includes(permissionKey)) {
        return res.status(403).json({
          message: `Forbidden: You do not have permission to ${required.action} ${required.resource}`,
        });
      }
    }

    next();
  };
};

// export const authorizeInstance = (resource: string, paramIdKey: string = "id") => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const authReq = req as AuthenticatedRequest;
//     const user = authReq.user;

//     console.log("──────────────── authorizeInstance ────────────────");
//     console.log("[authorizeInstance] resource =", resource);
//     console.log("[authorizeInstance] paramIdKey =", paramIdKey);

//     if (!user) {
//       console.warn("[authorizeInstance] No user object found");
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     console.log("[authorizeInstance]  user =", {
//       userId: user.userId,
//       roles: user.roles,
//     });

//     try {
//       const targetRecordId = req.params[paramIdKey];

//       console.log("[authorizeInstance]  raw params =", req.params);
//       console.log("[authorizeInstance]  targetRecordId =", targetRecordId, typeof targetRecordId);

//       if (!targetRecordId) {
//         console.warn(`[authorizeInstance] Missing param: ${paramIdKey}`);
//         return res.status(400).json({ message: `Missing required parameter: ${paramIdKey}` });
//       }

//       console.log(`[authorizeInstance] Querying UserAssetInstance`, {
//         userId: user.userId,
//         recordId: targetRecordId,
//         resource,
//       });

//       const userAssetInstance = await prisma.userAssetInstance.findFirst({
//         where: {
//           userId: user.userId,
//           assetInstance: {
//             recordId: targetRecordId,
//             asset: {
//               tableName: resource,
//             },
//           },
//         },
//         include: {
//           assetInstance: {
//             include: {
//               asset: true,
//             },
//           },
//         },
//       });

//       console.log("[authorizeInstance]  query result =", userAssetInstance);

//       if (userAssetInstance) {
//         console.log("[authorizeInstance] Instance access granted");
//         console.log("[authorizeInstance] assetInstance =", {
//           id: userAssetInstance.assetInstance.id,
//           recordId: userAssetInstance.assetInstance.recordId,
//           assetTable: userAssetInstance.assetInstance.asset.tableName,
//         });

//         authReq.assetInstance = userAssetInstance.assetInstance;
//         return next();
//       }

//       console.warn("[authorizeInstance] Access denied");
//       console.warn("[authorizeInstance] Reason possibilities:");
//       console.warn("  - No UserAssetInstance");
//       console.warn("  - recordId not found in AssetInstance");
//       console.warn("  - asset.tableName mismatch");

//       return res.status(403).json({
//         message: "Forbidden: You do not have permission to access this specific resource",
//       });
//     } catch (err) {
//       console.error("[authorizeInstance] DB Query Error:", err);
//       return res.status(500).json({ message: "Internal server error during instance check" });
//     }
//   };
// };

export const authorizeRole = (allowedRoles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      console.warn("[authorizeRole] No user in request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userRoles = authReq.user.roles;
    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // Admin bypass
    if (userRoles.includes(Role.Admin)) {
      return next();
    }

    const hasRole = userRoles.some((r) => rolesToCheck.includes(r));

    if (!hasRole) {
      console.warn("[authorizeRole] Forbidden: insufficient role", {
        userRoles,
        requiredRoles: rolesToCheck,
      });
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
};
