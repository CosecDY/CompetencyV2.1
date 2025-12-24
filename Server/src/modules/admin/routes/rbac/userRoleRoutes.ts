import { Router } from "express";
import { UserRoleController } from "@/modules/admin/controllers/rbac/userRoleController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.UserRole (ใน DB คือ "userRole")

// 1. Assign (เพิ่มอย่างเดียว)
router.post("/user-roles/assign-multiple", withAuth({ resource: Resource.UserRole, action: Action.Create }, UserRoleController.assignRole));

router.put("/user-roles", withAuth({ resource: Resource.UserRole, action: Action.Update }, UserRoleController.updateUserRoles));

// 3. Revoke (ลบทีละตัว)
router.delete("/user-roles", withAuth({ resource: Resource.UserRole, action: Action.Delete }, UserRoleController.revokeRole));

// 4. Get by User
router.get("/user-roles/user/:userId", withAuth({ resource: Resource.UserRole, action: Action.Read }, UserRoleController.getRolesByUser));

// 5. Get All
router.get("/user-roles", withAuth({ resource: Resource.UserRole, action: Action.Read }, UserRoleController.getAll));

export default router;
