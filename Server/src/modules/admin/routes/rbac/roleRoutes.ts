import { Router } from "express";
import { RoleController } from "@/modules/admin/controllers/rbac/roleController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.Role (ใน DB คือ "role")
router.post("/roles", withAuth({ resource: Resource.Role, action: Action.Create }, RoleController.create));

router.get("/roles", withAuth({ resource: Resource.Role, action: Action.Read }, RoleController.getAll));

router.get("/roles/:roleId", withAuth({ resource: Resource.Role, action: Action.Read }, RoleController.getById));

router.put("/roles/:roleId", withAuth({ resource: Resource.Role, action: Action.Update }, RoleController.update));

router.delete("/roles/:roleId", withAuth({ resource: Resource.Role, action: Action.Delete }, RoleController.delete));

export default router;
