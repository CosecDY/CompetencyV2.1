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
}

// Helper function to extract token from request
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return req.cookies?.token || null;
};

// Helper function to build user include query
const getUserIncludeQuery = () => ({
  userRoles: {
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: {
                include: {
                  asset: true,
                  operation: true,
                },
              },
            },
          },
        },
      },
    },
  },
  sessions: true,
});

// Helper function to update user session
const updateUserSession = async (sessions: any[]) => {
  if (!sessions?.length) return;

  const now = new Date();
  const activeSession = sessions
    .filter((s) => !s.expiresAt || s.expiresAt > now)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];

  if (activeSession) {
    await prisma.session.update({
      where: { id: activeSession.id },
      data: { lastActivityAt: now },
    });
  }
};

// Helper function to extract permissions from user roles
const extractPermissions = (userRoles: any[]): string[] => {
  return userRoles.flatMap(
    (ur) =>
      ur.role?.rolePermissions?.map(
        (rp) =>
          `${rp.permission.asset.tableName}:${rp.permission.operation.name}`
      ) || []
  );
};

// Helper function to extract roles from user roles
const extractRoles = (userRoles: any[]): string[] => {
  return userRoles.map((ur) => ur.role?.name).filter(Boolean) as string[];
};

// Main authentication middleware
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req);
    if (!token) {
      res.status(401).json({
        message: "Unauthorized: No token provided",
      });
      return;
    }

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      res.status(401).json({
        message: "Unauthorized: Invalid token",
      });
      return;
    }

    // Fetch user with related data
    const user = await prisma.user.findUnique({
      where: { id: String(payload.userId) },
      include: getUserIncludeQuery(),
    });

    if (!user) {
      res.status(401).json({
        message: "Unauthorized: User not found",
      });
      return;
    }

    // Update session activity
    await updateUserSession(user.sessions);

    // Extract permissions and roles
    const permissions = extractPermissions(user.userRoles);
    const roles = extractRoles(user.userRoles);

    // Attach user to request
    (req as AuthenticatedRequest).user = {
      userId: user.id,
      email: user.email,
      roles,
      permissions,
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(401).json({
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

// Role authorization middleware
export const authorizeRole = (allowedRoles: string | string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Admin bypass
    if (req.user.roles.includes(Role.Admin)) {
      next();
      return;
    }

    const rolesToCheck = Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles];

    const hasRequiredRole = req.user.roles.some((role) =>
      rolesToCheck.includes(role)
    );

    if (!hasRequiredRole) {
      res.status(403).json({
        message: "Forbidden: insufficient role",
      });
      return;
    }

    next();
  };
};

// Block user role middleware
export const blockUserRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (req.user.roles.includes(Role.User)) {
    res.status(403).json({
      message: "Forbidden: Users cannot access this resource",
    });
    return;
  }

  next();
};

// Permission authorization middleware
export const authorizePermission = (requiredPermissions: string | string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const required = Array.isArray(requiredPermissions)
      ? requiredPermissions
      : [requiredPermissions];

    const hasPermission = required.some((perm) =>
      user.permissions.includes(perm)
    );

    if (!hasPermission) {
      res.status(403).json({
        message: "Forbidden: insufficient permissions",
      });
      return;
    }

    next();
  };
};

// Instance authorization middleware
export const authorizeInstance = (resource: string, action: string) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Admin bypass
    if (user.roles.includes("Admin")) {
      next();
      return;
    }

    try {
      const userAssetInstance = await prisma.userAssetInstance.findFirst({
        where: {
          userId: user.userId,
          assetInstance: {
            asset: { tableName: resource },
          },
        },
        include: {
          assetInstance: {
            include: { asset: true },
          },
        },
      });

      if (!userAssetInstance) {
        const permissionKey = `${resource}:${action}`;
        if (!user.permissions.includes(permissionKey)) {
          res.status(403).json({
            message:
              "Forbidden: insufficient permissions (no instance + no role)",
          });
          return;
        }
        next();
        return;
      }

      const instance = userAssetInstance.assetInstance;
      const permissionKey = `${instance.asset.tableName}:${action}`;

      if (!user.permissions.includes(permissionKey)) {
        res.status(403).json({
          message: "Forbidden: insufficient permission for this object",
        });
        return;
      }

      (req as any).assetInstance = instance;
      next();
    } catch (err) {
      console.error("Instance authorization error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
