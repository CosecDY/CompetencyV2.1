import { Router, RequestHandler } from "express";
import { ClUcController } from "@Admin/controllers/tpqi/clUcController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevelUnitCode (ค่าใน DB คือ "tpqiCareerLevelUnitCode")
router.get("/", withAuth({ resource: Resource.TpqiCareerLevelUnitCode, action: Action.Read }, ClUcController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevelUnitCode, action: Action.Read }, ClUcController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevelUnitCode, action: Action.Create }, ClUcController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevelUnitCode, action: Action.Update }, ClUcController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevelUnitCode, action: Action.Delete }, ClUcController.delete as RequestHandler));

export default router;
