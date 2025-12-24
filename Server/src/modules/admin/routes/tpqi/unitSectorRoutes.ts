import { Router, RequestHandler } from "express";
import { UnitSectorController } from "@Admin/controllers/tpqi/unitSectorController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiUnitSector (ใน DB คือ "tpqiUnitSector")
router.get("/", withAuth({ resource: Resource.TpqiUnitSector, action: Action.Read }, UnitSectorController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiUnitSector, action: Action.Read }, UnitSectorController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiUnitSector, action: Action.Create }, UnitSectorController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiUnitSector, action: Action.Update }, UnitSectorController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiUnitSector, action: Action.Delete }, UnitSectorController.delete as RequestHandler));

export default router;
