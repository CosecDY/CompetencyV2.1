import { Router, RequestHandler } from "express";
import { UKnowledgeController } from "@Admin/controllers/tpqi/uKnowledgeController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUserKnowledge (ใน DB คือ "tpqiUserKnowledge")
router.get("/", withAuth({ resource: Resource.TpqiUserKnowledge, action: Action.Read }, UKnowledgeController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUserKnowledge, action: Action.Read }, UKnowledgeController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUserKnowledge, action: Action.Create }, UKnowledgeController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUserKnowledge, action: Action.Update }, UKnowledgeController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUserKnowledge, action: Action.Delete }, UKnowledgeController.delete as RequestHandler));

export default router;
