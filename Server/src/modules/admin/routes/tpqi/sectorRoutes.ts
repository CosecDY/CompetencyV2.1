import { Router, RequestHandler } from "express";
import { SectorController } from "@Admin/controllers/tpqi/sectorController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiSector (ค่าใน DB คือ "tpqiSector")
router.get("/", withAuth({ resource: Resource.TpqiSector, action: Action.Read }, SectorController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiSector, action: Action.Read }, SectorController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiSector, action: Action.Create }, SectorController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiSector, action: Action.Update }, SectorController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiSector, action: Action.Delete }, SectorController.delete as RequestHandler));

export default router;
