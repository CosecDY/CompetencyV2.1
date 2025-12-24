import { Router, RequestHandler } from "express";
import { CareerController } from "@Admin/controllers/tpqi/careerController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareer (ค่าใน DB คือ "tpqiCareer")
router.get("/", withAuth({ resource: Resource.TpqiCareer, action: Action.Read }, CareerController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareer, action: Action.Read }, CareerController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareer, action: Action.Create }, CareerController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareer, action: Action.Update }, CareerController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareer, action: Action.Delete }, CareerController.delete as RequestHandler));

export default router;
