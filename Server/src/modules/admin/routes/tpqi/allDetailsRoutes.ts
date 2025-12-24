import { Router, RequestHandler } from "express";
import { AllDetailsController } from "@Admin/controllers/tpqi/allDetailsController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevelDetail เพื่อระบุบริบทของ TPQI
router.get("/", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Read }, AllDetailsController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Read }, AllDetailsController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Create }, AllDetailsController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Update }, AllDetailsController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Delete }, AllDetailsController.delete as RequestHandler));

export default router;
