export interface UserRole {
  id: number;
  userId: string;
  userEmail?: string;
  roleId: number;
  assignedAt: string;
  role?: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface UserRoleAssignmentDto {
  userId: string;
  roleIds: number[];
}

export interface UserRoleListResponse {
  data: UserRole[];
  total: number;
}
