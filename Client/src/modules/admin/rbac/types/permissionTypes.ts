export interface Permission {
  id: number;
  operationId: number;
  assetId: number;
  createdAt: Date;
  updatedAt: Date;
  operation?: { id: number; name: string; description?: string | null } | null;
  asset?: { id: number; tableName: string; description?: string | null } | null;
}

export interface PermissionPageResult {
  data: Permission[];
  total: number;
}

export interface CreatePermissionDto {
  operationId: number;
  assetId: number;
}

export interface UpdatePermissionDto {
  operationId?: number;
  assetId?: number;
}
