import { Router, RequestHandler } from "express";
import { ClKnowledgeController } from "@Admin/controllers/tpqi/clKnowledgeController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevelKnowledge (ค่าใน DB คือ "tpqiCareerLevelKnowledge")
router.get("/", withAuth({ resource: Resource.TpqiCareerLevelKnowledge, action: Action.Read }, ClKnowledgeController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevelKnowledge, action: Action.Read }, ClKnowledgeController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevelKnowledge, action: Action.Create }, ClKnowledgeController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevelKnowledge, action: Action.Update }, ClKnowledgeController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevelKnowledge, action: Action.Delete }, ClKnowledgeController.delete as RequestHandler));

export default router;
