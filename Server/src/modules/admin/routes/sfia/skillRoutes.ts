import { Router, RequestHandler } from "express";
import { SkillController } from "@Admin/controllers/sfia/skillController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

router.get("/", withAuth({ resource: Resource.SfiaSkill, action: Action.Read }, SkillController.getAll as RequestHandler));

router.get(
  "/:code",
  withAuth(
    {
      resource: Resource.SfiaSkill,
      action: Action.Read,
    },
    SkillController.getById as RequestHandler
  )
);

router.post("/", withAuth({ resource: Resource.SfiaSkill, action: Action.Create }, SkillController.create as RequestHandler));

router.put(
  "/:code",
  withAuth(
    {
      resource: Resource.SfiaSkill,
      action: Action.Update,
    },
    SkillController.update as RequestHandler
  )
);

router.delete(
  "/:code",
  withAuth(
    {
      resource: Resource.SfiaSkill,
      action: Action.Delete,
    },
    SkillController.delete as RequestHandler
  )
);

export default router;
