import { Router } from "express";
import { OperationController } from "@/modules/admin/controllers/rbac/operationController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources"; // นำเข้า Enum มาใช้งาน

const router = Router();

// ใช้ Resource.Operation (ใน DB คือ "operation")
router.post("/operations", withAuth({ resource: Resource.Operation, action: Action.Create }, OperationController.createOperation));

router.get("/operations", withAuth({ resource: Resource.Operation, action: Action.Read }, OperationController.getOperations));

router.get("/operations/:id", withAuth({ resource: Resource.Operation, action: Action.Read }, OperationController.getOperationById));

router.put("/operations/:id", withAuth({ resource: Resource.Operation, action: Action.Update }, OperationController.updateOperation));

router.delete("/operations/:id", withAuth({ resource: Resource.Operation, action: Action.Delete }, OperationController.deleteOperation));

export default router;
