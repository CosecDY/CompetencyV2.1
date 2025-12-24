import { Request, Response, NextFunction } from "express";
import { UserRoleService } from "@/modules/admin/services/rbac/userRoleService";
import type { UserRole } from "@prisma/client_competency";

const service = new UserRoleService();

interface AuthenticatedRequest extends Request {
  user?: { userId?: string };
}

function UserRoleView(ur: UserRole & { role?: any; user?: { email?: string } }) {
  return {
    id: ur.id,
    userId: ur.userId,
    userEmail: ur.user?.email,
    roleId: ur.roleId,
    assignedAt: ur.assignedAt,
    role: ur.role
      ? {
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
        }
      : undefined,
  };
}

function UserRoleListView(items: (UserRole & { role?: any; user?: { email?: string } })[]) {
  return items.map(UserRoleView);
}

export class UserRoleController {
  // มอบ role ให้ user
  static async assignRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, roleIds } = req.body;
      const actor = req.user?.userId || "system";

      if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
        console.warn("[RBAC] Missing userId or roleIds in request body", req.body);
        return res.status(400).json({ error: "userId and roleIds are required" });
      }

      const assignedRoles = [];
      for (const roleId of roleIds) {
        try {
          const assigned = await service.assignRoleToUser(userId, roleId, actor);
          assignedRoles.push(assigned);
        } catch (err: any) {
          console.warn(`[RBAC] Failed to assign role ${roleId} to ${userId}:`, err.message);
        }
      }

      return res.status(201).json(assignedRoles.map(UserRoleView));
    } catch (error: any) {
      console.error("[RBAC] assignRole error:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  static async updateUserRoles(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, roleIds } = req.body;
      const actor = req.user?.userId || "system";

      if (!userId || !Array.isArray(roleIds)) {
        return res.status(400).json({ error: "userId and roleIds (array of numbers) are required" });
      }

      const result = await service.updateUserRoles(userId, roleIds, actor);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("[RBAC] updateUserRoles error:", error);

      return res.status(500).json({ error: error.message });
    }
  }

  // ยกเลิก role ของ user
  static async revokeRole(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userId, roleId } = req.body;
      const actor = req.user?.userId || "system";

      if (!userId || typeof roleId !== "number") {
        return res.status(400).json({ error: "userId and roleId are required" });
      }

      const revoked = await service.revokeRoleFromUser(userId, roleId, actor);
      return res.status(200).json(UserRoleView(revoked));
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  // ดึง role ทั้งหมดของ user
  static async getRolesByUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      const roles = await service.getRolesForUser(userId);
      return res.status(200).json(UserRoleListView(roles));
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, page, perPage } = req.query;

      const pageNumber = page ? parseInt(page as string, 10) : undefined;
      const perPageNumber = perPage ? parseInt(perPage as string, 10) : undefined;

      const result = await service.getAll(search as string | undefined, pageNumber, perPageNumber);

      return res.status(200).json({
        data: UserRoleListView(result.data),
        total: result.total,
      });
    } catch (error) {
      next(error);
    }
  }
}
