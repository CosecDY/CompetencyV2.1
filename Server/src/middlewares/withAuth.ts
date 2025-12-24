import { RequestHandler } from "express";
import { authenticate, authorizeRole, AuthenticatedRequest } from "./authMiddleware";

interface AuthOptions {
  resource?: string;
  action?: string;
  roles?: string | string[];
}

export const withAuth = (options: AuthOptions, handler: RequestHandler): RequestHandler[] => {
  const middlewares: RequestHandler[] = [authenticate];

  // 1. Role-based access
  if (options.roles) {
    middlewares.push(authorizeRole(options.roles));
  }

  // 2. General permission (resource:action)
  if (options.resource && options.action) {
    const generalPermissionMiddleware: RequestHandler = (req, res, next) => {
      const authReq = req as AuthenticatedRequest;
      const user = authReq.user;

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Admin / SuperAdmin bypass
      const isAdmin = user.roles.includes("Admin") || user.roles.includes("SuperAdmin");

      if (isAdmin) {
        return next();
      }

      const permissionKey = `${options.resource}:${options.action}`;
      const hasPermission = user.permissions.includes(permissionKey);

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        message: `Forbidden: No permission for ${permissionKey}`,
      });
    };

    middlewares.push(generalPermissionMiddleware);
  }

  return [...middlewares, handler];
};
