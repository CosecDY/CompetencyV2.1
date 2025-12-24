import { Router, RequestHandler } from "express";
import { LevelController } from "@Admin/controllers/tpqi/levelController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.TpqiLevel (ค่าใน DB คือ "tpqiLevel")
router.get("/", withAuth({ resource: Resource.TpqiLevel, action: Action.Read }, LevelController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.TpqiLevel, action: Action.Read }, LevelController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.TpqiLevel, action: Action.Create }, LevelController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.TpqiLevel, action: Action.Update }, LevelController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.TpqiLevel, action: Action.Delete }, LevelController.delete as RequestHandler));

export default router;
