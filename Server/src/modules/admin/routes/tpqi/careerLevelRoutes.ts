import { Router, RequestHandler } from "express";
import { CareerLevelController } from "@Admin/controllers/tpqi/careerLevelController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevel เพื่อระบุระดับอาชีพของฝั่ง TPQI
router.get("/", withAuth({ resource: Resource.TpqiCareerLevel, action: Action.Read }, CareerLevelController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevel, action: Action.Read }, CareerLevelController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevel, action: Action.Create }, CareerLevelController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevel, action: Action.Update }, CareerLevelController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevel, action: Action.Delete }, CareerLevelController.delete as RequestHandler));

export default router;
