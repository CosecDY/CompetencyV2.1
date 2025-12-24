import { Router, RequestHandler } from "express";
import { UsersSkillsController } from "@Admin/controllers/tpqi/usersSkillsController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUserUnitSkill (ใน DB คือ "tpqiUserUnitSkill")
router.get("/", withAuth({ resource: Resource.TpqiUserUnitSkill, action: Action.Read }, UsersSkillsController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUserUnitSkill, action: Action.Read }, UsersSkillsController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUserUnitSkill, action: Action.Create }, UsersSkillsController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUserUnitSkill, action: Action.Update }, UsersSkillsController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUserUnitSkill, action: Action.Delete }, UsersSkillsController.delete as RequestHandler));

export default router;
