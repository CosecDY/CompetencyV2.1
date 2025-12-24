import { Router } from "express";
import { UserAssetInstanceController } from "@/modules/admin/controllers/rbac/userAssetInstanceController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.UserAssetInstance (ใน DB คือ "userAssetInstance")
router.post("/user-asset-instances", withAuth({ resource: Resource.UserAssetInstance, action: Action.Create }, UserAssetInstanceController.assign));

router.delete("/user-asset-instances", withAuth({ resource: Resource.UserAssetInstance, action: Action.Delete }, UserAssetInstanceController.revoke));

router.get("/user-asset-instances/user/:userId", withAuth({ resource: Resource.UserAssetInstance, action: Action.Read }, UserAssetInstanceController.getForUser));

router.get("/user-asset-instances", withAuth({ resource: Resource.UserAssetInstance, action: Action.Read }, UserAssetInstanceController.getAll));

export default router;
