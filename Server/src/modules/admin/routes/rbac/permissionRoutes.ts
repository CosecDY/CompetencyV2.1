import { Router } from "express";
import { PermissionController } from "@/modules/admin/controllers/rbac/permissionController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.Permission เพื่อควบคุมสิทธิ์ในการกำหนดสิทธิ์ให้ผู้อื่น (Critical Path)
router.post("/permissions", withAuth({ resource: Resource.Permission, action: Action.Create }, PermissionController.create));

router.get("/permissions", withAuth({ resource: Resource.Permission, action: Action.Read }, PermissionController.getAll));

router.get("/permissions/:permissionId", withAuth({ resource: Resource.Permission, action: Action.Read }, PermissionController.getById));

router.put("/permissions/:permissionId", withAuth({ resource: Resource.Permission, action: Action.Update }, PermissionController.update));

router.delete("/permissions/:permissionId", withAuth({ resource: Resource.Permission, action: Action.Delete }, PermissionController.delete));

export default router;
