import { Router } from "express";
import { SessionController } from "@/modules/admin/controllers/rbac/sessionController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources"; // นำเข้า Enum มาใช้งาน

const router = Router();

// ใช้ Resource.Session (ใน DB คือ "session") เพื่อควบคุมสิทธิ์การจัดการ Login Session
router.post("/sessions", withAuth({ resource: Resource.Session, action: Action.Create }, SessionController.createSession));

router.get("/sessions", withAuth({ resource: Resource.Session, action: Action.Read }, SessionController.getAll));

router.get("/sessions/:id", withAuth({ resource: Resource.Session, action: Action.Read }, SessionController.getSessionById));

router.get("/sessions/by-access-token", withAuth({ resource: Resource.Session, action: Action.Read }, SessionController.getSessionByAccessToken));

router.get("/sessions/by-refresh-token", withAuth({ resource: Resource.Session, action: Action.Read }, SessionController.getSessionByRefreshToken));

router.delete("/sessions/:id", withAuth({ resource: Resource.Session, action: Action.Delete }, SessionController.deleteSessionById));

router.delete("/sessions/user/:userId", withAuth({ resource: Resource.Session, action: Action.Delete }, SessionController.deleteSessionsByUserId));

router.get("/sessions/:id/expired", withAuth({ resource: Resource.Session, action: Action.Read }, SessionController.isSessionExpired));

export default router;
