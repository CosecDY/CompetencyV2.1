import { Router, RequestHandler } from "express";
import { DetailsController } from "@Admin/controllers/tpqi/detailsController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiCareerLevelDetail (ซึ่งใน DB คือ "tpqiCareerLevelDetail")
router.get("/", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Read }, DetailsController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Read }, DetailsController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Create }, DetailsController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Update }, DetailsController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiCareerLevelDetail, action: Action.Delete }, DetailsController.delete as RequestHandler));

export default router;
