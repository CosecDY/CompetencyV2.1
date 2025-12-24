import { Router, RequestHandler } from "express";
import { USkillController } from "@Admin/controllers/tpqi/uSkillController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUserSkill (ใน DB คือ "tpqiUserSkill")
router.get("/", withAuth({ resource: Resource.TpqiUserSkill, action: Action.Read }, USkillController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUserSkill, action: Action.Read }, USkillController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUserSkill, action: Action.Create }, USkillController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUserSkill, action: Action.Update }, USkillController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUserSkill, action: Action.Delete }, USkillController.delete as RequestHandler));

export default router;
