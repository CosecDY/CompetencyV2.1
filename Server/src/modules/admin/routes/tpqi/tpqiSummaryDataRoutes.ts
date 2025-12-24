import { Router, RequestHandler } from "express";
import { TpqiSummaryDataController } from "@Admin/controllers/tpqi/tpqiSummaryDataController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiSummary (ใน DB คือ "tpqiSummary")
router.get("/", withAuth({ resource: Resource.TpqiSummary, action: Action.Read }, TpqiSummaryDataController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiSummary, action: Action.Read }, TpqiSummaryDataController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiSummary, action: Action.Create }, TpqiSummaryDataController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiSummary, action: Action.Update }, TpqiSummaryDataController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiSummary, action: Action.Delete }, TpqiSummaryDataController.delete as RequestHandler));

export default router;
