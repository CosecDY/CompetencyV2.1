// --- Role ---
export interface Role {
  id: number;
  name: string;
  description?: string | null;
  parentRoleId?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface RolePageResult {
  data: Role[];
  total: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  parentRoleId?: number;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  parentRoleId?: number;
}

export enum RoleName {
  Admin = "Admin",
  Manager = "Manager",
  User = "User",
}
