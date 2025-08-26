import { Router, RequestHandler } from "express";
import { SubcategoryController } from "@Admin/controllers/sfia/subcategoryController";
import { authenticate, authorizePermission } from "@Middlewares/authMiddleware";

const router: Router = Router();

const withPermission = (action: string) => [authenticate, authorizePermission(`subcategory:${action}`) as RequestHandler];

router.get("/", ...withPermission("view"), SubcategoryController.getAll as RequestHandler);
router.get("/:id", ...withPermission("view"), SubcategoryController.getById as RequestHandler);
router.post("/", ...withPermission("create"), SubcategoryController.create as RequestHandler);
router.put("/:id", ...withPermission("edit"), SubcategoryController.update as RequestHandler);
router.delete("/:id", ...withPermission("delete"), SubcategoryController.delete as RequestHandler);

export default router;
