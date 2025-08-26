import { authenticate, authorize, authorizeRole, authorizePermission } from "./authMiddleware";

/**
 * Middleware สำหรับเช็คสิทธิ์การจัดการผู้ใช้
 */
export const canManageUsers = [authenticate, authorize("users", "manage")];

/**
 * Middleware สำหรับให้เฉพาะ admin เข้าได้
 */
export const isAdminOnly = [authenticate, authorizeRole("admin")];

/**
 * Middleware สำหรับเช็คสิทธิ์การสร้าง post
 */
export const canCreatePost = [authenticate, authorizePermission("posts:create")];

/**
 * Middleware สำหรับเช็คสิทธิ์การแก้ไข post หรือ ลบ post
 */
export const canEditOrDeletePost = [authenticate, authorizePermission(["posts:edit", "posts:delete"])];
