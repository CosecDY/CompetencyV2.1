import { Router, RequestHandler } from "express";
import { UsersKnowledgeController } from "@Admin/controllers/tpqi/usersKnowledgeController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUserUnitKnowledge (ใน DB คือ "tpqiUserUnitKnowledge")
router.get("/", withAuth({ resource: Resource.TpqiUserUnitKnowledge, action: Action.Read }, UsersKnowledgeController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUserUnitKnowledge, action: Action.Read }, UsersKnowledgeController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUserUnitKnowledge, action: Action.Create }, UsersKnowledgeController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUserUnitKnowledge, action: Action.Update }, UsersKnowledgeController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUserUnitKnowledge, action: Action.Delete }, UsersKnowledgeController.delete as RequestHandler));

export default router;
