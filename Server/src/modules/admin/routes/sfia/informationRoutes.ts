import { Router, RequestHandler } from "express";
import { InformationController } from "@Admin/controllers/sfia/informationController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

router.get("/", withAuth({ resource: Resource.SfiaInformation, action: Action.Read }, InformationController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaInformation, action: Action.Read }, InformationController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaInformation, action: Action.Create }, InformationController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaInformation, action: Action.Update }, InformationController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaInformation, action: Action.Delete }, InformationController.delete as RequestHandler));

export default router;
