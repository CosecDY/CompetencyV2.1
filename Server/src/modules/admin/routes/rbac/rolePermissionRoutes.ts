import { Router } from "express";
import { RolePermissionController } from "@/modules/admin/controllers/rbac/rolePermissionController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";
const router = Router();

// ใช้ Resource.RolePermission (ใน DB คือ "rolePermission")
router.post("/role-permissions", withAuth({ resource: Resource.RolePermission, action: Action.Create }, RolePermissionController.assignPermission));

router.delete("/role-permissions", withAuth({ resource: Resource.RolePermission, action: Action.Delete }, RolePermissionController.revokePermission));

router.get("/role-permissions/role/:roleId", withAuth({ resource: Resource.RolePermission, action: Action.Read }, RolePermissionController.getPermissionsByRole));

export default router;
