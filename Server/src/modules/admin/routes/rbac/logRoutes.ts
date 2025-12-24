import { Router } from "express";
import { LogController } from "@/modules/admin/controllers/rbac/logController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.Log เพื่อควบคุมการเข้าถึงข้อมูลบันทึกกิจกรรมในระบบ (Audit Trail)
router.post("/logs", withAuth({ resource: Resource.Log, action: Action.Create }, LogController.createLog));

router.get("/logs", withAuth({ resource: Resource.Log, action: Action.Read }, LogController.getLogs));

router.get("/logs/:id", withAuth({ resource: Resource.Log, action: Action.Read }, LogController.getLogById));

export default router;
