import { Router, RequestHandler } from "express";
import { UnitCodeController } from "@Admin/controllers/tpqi/unitCodeController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUnitCode (ใน DB คือ "tpqiUnitCode")
router.get("/", withAuth({ resource: Resource.TpqiUnitCode, action: Action.Read }, UnitCodeController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUnitCode, action: Action.Read }, UnitCodeController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUnitCode, action: Action.Create }, UnitCodeController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUnitCode, action: Action.Update }, UnitCodeController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUnitCode, action: Action.Delete }, UnitCodeController.delete as RequestHandler));

export default router;
