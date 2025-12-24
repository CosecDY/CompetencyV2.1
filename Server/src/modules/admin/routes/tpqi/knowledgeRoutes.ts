import { Router, RequestHandler } from "express";
import { KnowledgeController } from "@Admin/controllers/tpqi/knowledgeController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiKnowledge (ค่าใน DB คือ "tpqiKnowledge")
router.get("/", withAuth({ resource: Resource.TpqiKnowledge, action: Action.Read }, KnowledgeController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiKnowledge, action: Action.Read }, KnowledgeController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiKnowledge, action: Action.Create }, KnowledgeController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiKnowledge, action: Action.Update }, KnowledgeController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiKnowledge, action: Action.Delete }, KnowledgeController.delete as RequestHandler));

export default router;
