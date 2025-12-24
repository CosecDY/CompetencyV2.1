import { Router, RequestHandler } from "express";
import { DescriptionController } from "@Admin/controllers/sfia/descriptionController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

router.get("/", withAuth({ resource: Resource.SfiaDescription, action: Action.Read }, DescriptionController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaDescription, action: Action.Read }, DescriptionController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaDescription, action: Action.Create }, DescriptionController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaDescription, action: Action.Update }, DescriptionController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaDescription, action: Action.Delete }, DescriptionController.delete as RequestHandler));

export default router;
