import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client_competency";
import { verifyToken } from "@Utils/tokenUtils";
import { Role } from "./authEnums";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    roles: string[];
    permissions: string[];
  };
  assetInstance?: any;
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.split(" ")[1] : req.cookies?.accessToken;
    if (!token) {
      console.log("No token found in Header or Cookie");
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.userId) },
      select: {
        id: true,
        email: true,
        sessions: {
          where: {
            expiresAt: { gt: new Date() },
          },
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

    if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });

    // 3. Performance Fix: Debounce Session Update (ลด Write Load)
    if (user.sessions?.length) {
      const latestSession = user.sessions[0];
      const now = new Date();
      const UPDATE_THRESHOLD = 5 * 60 * 1000;

      if (latestSession && now.getTime() - new Date(latestSession.updatedAt).getTime() > UPDATE_THRESHOLD) {
        prisma.session
          .update({
            where: { id: latestSession.id },
            data: { lastActivityAt: now },
          })
          .catch((err) => console.error("Session update failed", err));
      }
    }

    // Construct Permissions
    const permissions = user.userRoles.flatMap((ur) => ur.role?.rolePermissions?.map((rp) => `${rp.permission.asset.tableName}:${rp.permission.operation.name}`) || []);

    // Remove duplicates
    const uniquePermissions = Array.from(new Set(permissions));

    const roles = user.userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

    (req as AuthenticatedRequest).user = {
      userId: user.id,
      email: user.email,
      roles,
      permissions: uniquePermissions,
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

    if (!token) {
      return next();
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: String(payload.userId) },
      select: {
        id: true,
        email: true,
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

    if (user) {
      const permissions = user.userRoles.flatMap((ur) => ur.role?.rolePermissions?.map((rp) => `${rp.permission.asset.tableName}:${rp.permission.operation.name}`) || []);

      const uniquePermissions = Array.from(new Set(permissions));
      const roles = user.userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];

      (req as AuthenticatedRequest).user = {
        userId: user.id,
        email: user.email,
        roles,
        permissions: uniquePermissions,
      };
    }

    next();
  } catch (err) {
    console.error("Optional Auth Error:", err);
    next();
  }
};

export const authorizeRole = (allowedRoles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.roles.includes(Role.Admin)) return next();

    const rolesToCheck = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!req.user.roles.some((r) => rolesToCheck.includes(r))) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }
    next();
  };
};

export const authorizePermission = (requiredPermissions: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    if (user.roles.includes(Role.Admin)) return next();

    const required = Array.isArray(requiredPermissions) ? requiredPermissions : [requiredPermissions];
    const hasPermission = required.some((perm) => user.permissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions" });
    }
    next();
  };
};

// 4. Logic Fix: authorizeInstance
export const authorizeInstance = (resource: string, action: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthenticatedRequest;
    const user = authReq.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.roles.includes("Admin")) return next();

    try {
      const permissionKey = `${resource}:${action}`;
      const hasGenericPermission = user.permissions.includes(permissionKey);

      const userAssetInstance = await prisma.userAssetInstance.findFirst({
        where: {
          userId: user.userId,
          assetInstance: {
            asset: { tableName: resource },
          },
        },
        include: { assetInstance: { include: { asset: true } } },
      });

      if (!userAssetInstance) {
        if (!hasGenericPermission) {
          return res.status(403).json({ message: "Forbidden: No permission for this resource" });
        }
        return next();
      }

      authReq.assetInstance = userAssetInstance.assetInstance;
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
