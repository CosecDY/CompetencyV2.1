import { Role } from "./roleTypes";
export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  grantedAt: string | Date;

  role?: Role;

  permission?: {
    id: number;
    operationId: number;
    assetId: number;
    createdAt: string | Date;
    updatedAt: string | Date;

    operation?: {
      id: number;
      name: string;
      description?: string | null;
      updatedAt: string | Date;
    };

    asset?: {
      id: number;
      tableName: string;
      description?: string | null;
      updatedAt: string | Date;
      instances?: any[];
    };
  };
}
