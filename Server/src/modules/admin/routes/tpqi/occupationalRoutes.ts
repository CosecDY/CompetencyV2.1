import { Router, RequestHandler } from "express";
import { OccupationalController } from "@Admin/controllers/tpqi/occupationalController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiOccupational (ค่าใน DB คือ "tpqiOccupational")
router.get("/", withAuth({ resource: Resource.TpqiOccupational, action: Action.Read }, OccupationalController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiOccupational, action: Action.Read }, OccupationalController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiOccupational, action: Action.Create }, OccupationalController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiOccupational, action: Action.Update }, OccupationalController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiOccupational, action: Action.Delete }, OccupationalController.delete as RequestHandler));

export default router;
