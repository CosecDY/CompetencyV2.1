import { Router, RequestHandler } from "express";
import { LevelController } from "@Admin/controllers/sfia/levelController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

router.get("/", withAuth({ resource: Resource.SfiaLevel, action: Action.Read }, LevelController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaLevel, action: Action.Read }, LevelController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaLevel, action: Action.Create }, LevelController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaLevel, action: Action.Update }, LevelController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaLevel, action: Action.Delete }, LevelController.delete as RequestHandler));

export default router;
