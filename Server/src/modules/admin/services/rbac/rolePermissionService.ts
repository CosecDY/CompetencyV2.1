import { RolePermissionsRepository } from "@Competency/repositories/RoleRepository";
import type { RolePermission } from "@prisma/client_competency";
import { BaseService } from "@Utils/BaseService";

export class RolePermissionService extends BaseService<RolePermission, keyof RolePermission> {
  constructor() {
    super(new RolePermissionsRepository(), ["roleId", "permissionId"], "id");
  }

  /**
   * Assign a permission to a role if not already assigned.
   */
  async assignPermissionToRole(roleId: number, permissionId: number, actor: string = "system") {
    const existing = await this.repo.findFirst({
      where: { roleId, permissionId },
    });
    if (existing) {
      throw new Error("Permission already assigned to role");
    }
    return this.repo.create({ roleId, permissionId, grantedAt: new Date() }, actor);
  }

  /**
   * Revoke a permission from a role if it exists.
   */
  async revokePermissionFromRole(roleId: number, permissionId: number, actor: string = "system") {
    console.log("[RolePermissionService] revokePermissionFromRole called with:", { roleId, permissionId, actor });

    const existing = await this.repo.findFirst({
      where: { roleId, permissionId },
    });

    if (!existing) {
      console.log("[RolePermissionService] No permission assignment found for roleId:", roleId, "permissionId:", permissionId);
      throw new Error("No permission assignment found for role");
    }

    console.log("[RolePermissionService] Found permission assignment:", existing);

    return this.repo.delete(existing.id, actor);
  }

  /**
   * Retrieve all permissions assigned to a given role.
   */
  async getPermissionsForRole(roleId: number) {
    return this.repo.findMany({
      where: { roleId },
      include: {
        permission: {
          include: {
            operation: true,
            asset: true,
          },
        },
      },
    });
  }
}
