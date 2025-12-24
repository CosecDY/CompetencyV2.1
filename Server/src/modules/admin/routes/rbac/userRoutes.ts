import { Router } from "express";
import { UserController } from "@/modules/admin/controllers/rbac/userController";
import { withAuth } from "@/middlewares/withAuth";
import { Action, Resource } from "@Constants/resources";

const router = Router();

// ใช้ Resource.User (ใน DB คือ "user") เพื่อจัดการข้อมูลบัญชีผู้ใช้งาน
router.post("/users", withAuth({ resource: Resource.User, action: Action.Create }, UserController.createUser));

router.get("/users", withAuth({ resource: Resource.User, action: Action.Read }, UserController.getAll));

router.get("/users/search-by-email", withAuth({ resource: Resource.User, action: Action.Read }, UserController.searchUsersByEmail));

router.get("/users/:id", withAuth({ resource: Resource.User, action: Action.Read }, UserController.getUserById));

router.get("/users/by-email", withAuth({ resource: Resource.User, action: Action.Read }, UserController.getUserByEmail));

router.put("/users/:id", withAuth({ resource: Resource.User, action: Action.Update }, UserController.updateUser));

router.delete("/users/:id", withAuth({ resource: Resource.User, action: Action.Delete }, UserController.deleteUser));

export default router;
