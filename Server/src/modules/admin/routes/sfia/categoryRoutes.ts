import { Router, RequestHandler } from "express";
import { CategoryController } from "@Admin/controllers/sfia/categoryController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

router.get("/", withAuth({ resource: Resource.SfiaCategory, action: Action.Read }, CategoryController.getAll as RequestHandler));
router.get("/:id", withAuth({ resource: Resource.SfiaCategory, action: Action.Read }, CategoryController.getById as RequestHandler));
router.post("/", withAuth({ resource: Resource.SfiaCategory, action: Action.Create }, CategoryController.create as RequestHandler));
router.put("/:id", withAuth({ resource: Resource.SfiaCategory, action: Action.Update }, CategoryController.update as RequestHandler));
router.delete("/:id", withAuth({ resource: Resource.SfiaCategory, action: Action.Delete }, CategoryController.delete as RequestHandler));

export default router;
