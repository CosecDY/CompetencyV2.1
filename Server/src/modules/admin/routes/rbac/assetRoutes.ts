import { Router } from "express";
import { AssetController } from "@/modules/admin/controllers/rbac/assetController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.Asset เพื่อควบคุมสิทธิ์ในการนิยามทรัพยากรใหม่ๆ ในระบบ
router.post("/assets", withAuth({ resource: Resource.Asset, action: Action.Create }, AssetController.createAsset));

router.get("/assets", withAuth({ resource: Resource.Asset, action: Action.Read }, AssetController.getAll));

router.put("/assets/:id", withAuth({ resource: Resource.Asset, action: Action.Update }, AssetController.updateAsset));

router.delete("/assets/:id", withAuth({ resource: Resource.Asset, action: Action.Delete }, AssetController.deleteAsset));

export default router;
