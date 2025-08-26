import { Request, Response, NextFunction } from "express";
import { RolePermissionService } from "@/modules/admin/services/rbac/rolePermissionService";
import type { RolePermission } from "@prisma/client_competency";

const service = new RolePermissionService();

interface AuthenticatedRequest extends Request {
  user?: { userId?: string };
}

function RolePermissionView(rp: RolePermission & { permission?: any }) {
  return {
    id: rp.id,
    roleId: rp.roleId,
    permissionId: rp.permissionId,
    grantedAt: rp.grantedAt,
    permission: rp.permission
      ? {
          id: rp.permission.id,
          operationId: rp.permission.operationId,
          assetId: rp.permission.assetId,
          createdAt: rp.permission.createdAt,
          updatedAt: rp.permission.updatedAt,
          operation: rp.permission.operation
            ? {
                id: rp.permission.operation.id,
                name: rp.permission.operation.name,
                description: rp.permission.operation.description,
                updatedAt: rp.permission.operation.updatedAt,
              }
            : undefined,
          asset: rp.permission.asset
            ? {
                id: rp.permission.asset.id,
                tableName: rp.permission.asset.tableName,
                description: rp.permission.asset.description,
                updatedAt: rp.permission.asset.updatedAt,
              }
            : undefined,
        }
      : undefined,
  };
}

function RolePermissionListView(items: (RolePermission & { permission?: any })[]) {
  return items.map(RolePermissionView);
}

export class RolePermissionController {
  // มอบสิทธิ์ให้ role
  static async assignPermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { roleId, permissionId } = req.body;
      const actor = req.user?.userId || "system";

      if (typeof roleId !== "number" || typeof permissionId !== "number") {
        return res.status(400).json({ error: "roleId and permissionId must be numbers" });
      }

      const assigned = await service.assignPermissionToRole(roleId, permissionId, actor);
      return res.status(201).json(RolePermissionView(assigned));
    } catch (error) {
      next(error);
    }
  }

  // ยกเลิกสิทธิ์ของ role
  static async revokePermission(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { roleId, permissionId } = req.body;
      const actor = req.user?.userId || "system";

      if (typeof roleId !== "number" || typeof permissionId !== "number") {
        return res.status(400).json({ error: "roleId and permissionId must be numbers" });
      }

      const revoked = await service.revokePermissionFromRole(roleId, permissionId, actor);
      return res.status(200).json(RolePermissionView(revoked));
    } catch (error) {
      next(error);
    }
  }

  // ดึงสิทธิ์ทั้งหมดของ role
  static async getPermissionsByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const roleId = Number(req.params.roleId);
      if (isNaN(roleId)) {
        return res.status(400).json({ error: "Invalid roleId" });
      }

      const permissions = await service.getPermissionsForRole(roleId);
      return res.status(200).json(RolePermissionListView(permissions));
    } catch (error) {
      next(error);
    }
  }
}
