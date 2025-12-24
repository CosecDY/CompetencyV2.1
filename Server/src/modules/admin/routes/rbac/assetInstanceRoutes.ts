import { Router } from "express";
import { AssetInstanceController } from "@/modules/admin/controllers/rbac/assetInstanceController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.AssetInstance เพื่อจัดการสิทธิ์ในระบบ RBAC
router.post("/asset-instances", withAuth({ resource: Resource.AssetInstance, action: Action.Create }, AssetInstanceController.createInstance));

router.delete("/asset-instances/:id", withAuth({ resource: Resource.AssetInstance, action: Action.Delete }, AssetInstanceController.deleteInstanceById));

router.delete("/asset-instances", withAuth({ resource: Resource.AssetInstance, action: Action.Delete }, AssetInstanceController.deleteInstance));

router.get("/asset-instances/asset/:assetId", withAuth({ resource: Resource.AssetInstance, action: Action.Read }, AssetInstanceController.getInstancesByAsset));

router.get("/asset-instances", withAuth({ resource: Resource.AssetInstance, action: Action.Read }, AssetInstanceController.getAll));

router.get("/asset-instances/:id", withAuth({ resource: Resource.AssetInstance, action: Action.Read }, AssetInstanceController.getInstanceById));

router.put("/asset-instances/:id", withAuth({ resource: Resource.AssetInstance, action: Action.Update }, AssetInstanceController.updateInstanceRecord));

export default router;
