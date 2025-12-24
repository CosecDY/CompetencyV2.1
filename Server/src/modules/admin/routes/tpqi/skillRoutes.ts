import { Router, RequestHandler } from "express";
import { SkillController } from "@Admin/controllers/tpqi/skillController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiSkill (ค่าใน DB คือ "tpqiSkill")
router.get("/", withAuth({ resource: Resource.TpqiSkill, action: Action.Read }, SkillController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiSkill, action: Action.Read }, SkillController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiSkill, action: Action.Create }, SkillController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiSkill, action: Action.Update }, SkillController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiSkill, action: Action.Delete }, SkillController.delete as RequestHandler));

export default router;
