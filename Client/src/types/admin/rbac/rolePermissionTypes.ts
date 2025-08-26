// --- RolePermission ---
import { Permission } from "./permissionTypes";

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  grantedAt: string;

  role?: {
    id: number;
    name: string;
    description?: string | null;
  };

  permission?: Permission; // ใช้ type Permission ที่รวม operation และ asset แล้ว
}
