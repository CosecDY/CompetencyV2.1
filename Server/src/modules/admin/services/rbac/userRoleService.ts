import { UserRolesRepository } from "@/modules/admin/repositories/RoleRepository";
import type { UserRole } from "@prisma/client_competency";
import { BaseService } from "@Utils/BaseService";
import { COMPETENCY } from "@/db/dbManagers";
export class UserRoleService extends BaseService<UserRole, keyof UserRole> {
  constructor() {
    super(new UserRolesRepository(), ["userId"], "id");
  }

  async assignRoleToUser(userId: string, roleId: number, actor: string = "system") {
    try {
      const existing = await this.repo.findFirst({ where: { userId, roleId } });
      if (existing) {
        throw new Error("Role already assigned to user");
      }

      const result = await this.repo.create({ userId, roleId, assignedAt: new Date() }, actor);

      return result;
    } catch (error) {
      console.error(`[RBAC] Failed to assign role ${roleId} to user ${userId}:`, error);
      throw error;
    }
  }

  async revokeRoleFromUser(userId: string, roleId: number, actor: string = "system") {
    const existing = await this.repo.findFirst({ where: { userId, roleId } });
    if (!existing) throw new Error("Role not assigned to user");
    return this.repo.delete(existing.id, actor);
  }

  async getRolesForUser(userId: string) {
    return this.repo.findMany({
      where: { userId },
      include: {
        role: true,
      },
    });
  }

  async getAll(search?: string, page?: number, perPage?: number) {
    const where: any = {};

    if (search && search.trim()) {
      const trimmed = search.trim();
      where.user = { email: { contains: trimmed } };
    }

    const commonQuery: any = {
      where,
      include: {
        role: { select: { id: true, name: true, description: true } },
        user: { select: { id: true, email: true } },
      },
    };

    if (page !== undefined && perPage !== undefined) {
      const data = await this.repo.findMany({
        ...commonQuery,
        skip: (page - 1) * perPage,
        take: perPage,
      });
      const total = await this.repo.manager.count({ where });
      return { data, total };
    }

    const data = await this.repo.findMany(commonQuery);
    return { data, total: data.length };
  }

  async updateUserRoles(userId: string, roleIds: number[], actor: string = "system") {
    try {
      await COMPETENCY.userRole.deleteMany({
        where: {
          userId: userId,
          roleId: { notIn: roleIds },
        },
      });

      // 2. ตรวจสอบ Role ปัจจุบันที่เหลืออยู่ (หลังจากลบ)
      const currentRoles = await COMPETENCY.userRole.findMany({
        where: {
          userId: userId,
          roleId: { in: roleIds },
        },
        select: { roleId: true },
      });

      const currentRoleIds = currentRoles.map((r: any) => r.roleId);

      // 3. กรองหา ID ใหม่ที่ต้องเพิ่มจริงๆ
      const newRoleIds = roleIds.filter((id: number) => !currentRoleIds.includes(id));

      // 4. เพิ่ม Role ใหม่ (ถ้ามี)
      if (newRoleIds.length > 0) {
        await COMPETENCY.userRole.createMany({
          data: newRoleIds.map((roleId: number) => ({
            userId: userId,
            roleId: roleId,
            assignedAt: new Date(),
          })),
        });
      }

      // 5. ดึงข้อมูลล่าสุดกลับไปแสดงผล
      return await COMPETENCY.userRole.findMany({
        where: { userId },
        include: {
          role: true,
          user: { select: { email: true } },
        },
      });
    } catch (error: any) {
      console.error(`[RBAC] Failed to update roles for user ${userId}:`, error.message);
      throw error;
    }
  }
}
