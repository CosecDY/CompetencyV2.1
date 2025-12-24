import { Router, RequestHandler } from "express";
import { SubcategoryController } from "@Admin/controllers/sfia/subcategoryController";
import { withAuth } from "@Middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router: Router = Router();

// ใช้ Resource.SfiaSubcategory เพื่อระบุเจาะจงว่าเป็นหมวดย่อยของ SFIA
router.get("/", withAuth({ resource: Resource.SfiaSubcategory, action: Action.Read }, SubcategoryController.getAll as RequestHandler));

router.get("/:id", withAuth({ resource: Resource.SfiaSubcategory, action: Action.Read }, SubcategoryController.getById as RequestHandler));

router.post("/", withAuth({ resource: Resource.SfiaSubcategory, action: Action.Create }, SubcategoryController.create as RequestHandler));

router.put("/:id", withAuth({ resource: Resource.SfiaSubcategory, action: Action.Update }, SubcategoryController.update as RequestHandler));

router.delete("/:id", withAuth({ resource: Resource.SfiaSubcategory, action: Action.Delete }, SubcategoryController.delete as RequestHandler));

export default router;
