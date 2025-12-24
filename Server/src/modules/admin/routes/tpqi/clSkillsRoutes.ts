import { Router, RequestHandler } from "express";
import { ClSkillsController } from "@Admin/controllers/tpqi/clSkillsController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevelSkill (ค่าใน DB คือ "tpqiCareerLevelSkill")
router.get("/", withAuth({ resource: Resource.TpqiCareerLevelSkill, action: Action.Read }, ClSkillsController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevelSkill, action: Action.Read }, ClSkillsController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevelSkill, action: Action.Create }, ClSkillsController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevelSkill, action: Action.Update }, ClSkillsController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevelSkill, action: Action.Delete }, ClSkillsController.delete as RequestHandler));

export default router;
