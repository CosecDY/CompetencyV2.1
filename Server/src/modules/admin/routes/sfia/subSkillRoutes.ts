import { Router, RequestHandler } from "express";
import { SubSkillController } from "@Admin/controllers/sfia/subSkillController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.SfiaSubSkill เพื่อระบุว่าเป็นทักษะย่อยของ SFIA
router.get("/", withAuth({ resource: Resource.SfiaSubSkill, action: Action.Read }, SubSkillController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaSubSkill, action: Action.Read }, SubSkillController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaSubSkill, action: Action.Create }, SubSkillController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaSubSkill, action: Action.Update }, SubSkillController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaSubSkill, action: Action.Delete }, SubSkillController.delete as RequestHandler));

export default router;
