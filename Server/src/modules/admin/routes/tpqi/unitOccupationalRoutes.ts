import { Router, RequestHandler } from "express";
import { UnitOccupationalController } from "@Admin/controllers/tpqi/unitOccupationalController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUnitOccupational (ใน DB คือ "tpqiUnitOccupational")
router.get("/", withAuth({ resource: Resource.TpqiUnitOccupational, action: Action.Read }, UnitOccupationalController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUnitOccupational, action: Action.Read }, UnitOccupationalController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUnitOccupational, action: Action.Create }, UnitOccupationalController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUnitOccupational, action: Action.Update }, UnitOccupationalController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUnitOccupational, action: Action.Delete }, UnitOccupationalController.delete as RequestHandler));

export default router;
