import { AxiosResponse } from "axios";
import api from "@Services/api";
import { Permission, PermissionPageResult, CreatePermissionDto, UpdatePermissionDto } from "modules/admin/rbac/types/permissionTypes";

export const PermissionsService = {
  getAllPermissions: async (search?: string, page?: number, perPage?: number): Promise<PermissionPageResult> => {
    const params = new URLSearchParams();
    const normalizedSearch = search?.trim() || "";
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));
    params.append("search", normalizedSearch);

    const res: AxiosResponse<PermissionPageResult> = await api.get("/admin/rbac/permissions", { params });
    return res.data;
  },

  getPermissionById: async (id: number): Promise<Permission> => {
    const res: AxiosResponse<Permission> = await api.get(`/admin/rbac/permissions/${id}`);
    return res.data;
  },

  createPermission: async (payload: CreatePermissionDto): Promise<Permission> => {
    const res: AxiosResponse<Permission> = await api.post("/admin/rbac/permissions", payload);
    return res.data;
  },

  updatePermission: async (id: number, payload: UpdatePermissionDto): Promise<Permission> => {
    const res: AxiosResponse<Permission> = await api.put(`/admin/rbac/permissions/${id}`, payload);
    return res.data;
  },

  deletePermission: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/permissions/${id}`);
  },
};
