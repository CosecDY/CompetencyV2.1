import { Router, RequestHandler } from "express";
import { SummaryDataController } from "@Admin/controllers/sfia/summaryDataController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.SfiaSummary (ซึ่งใน DB คือ "sfiaSummary")
router.get("/", withAuth({ resource: Resource.SfiaSummary, action: Action.Read }, SummaryDataController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaSummary, action: Action.Read }, SummaryDataController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaSummary, action: Action.Create }, SummaryDataController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaSummary, action: Action.Update }, SummaryDataController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaSummary, action: Action.Delete }, SummaryDataController.delete as RequestHandler));

export default router;
