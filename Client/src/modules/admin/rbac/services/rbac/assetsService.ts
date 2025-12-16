import { AxiosResponse } from "axios";
import api from "@Services/api";
import { Asset, AssetPageResult, CreateAssetDto, UpdateAssetDto } from "modules/admin/rbac/types/assetTypes";
import { RolePermission } from "modules/admin/rbac/types/rbac/rolePermissionTypes";

export const AssetsService = {
  getAllAssets: async (search?: string, page?: number, perPage?: number): Promise<AssetPageResult> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res: AxiosResponse<AssetPageResult> = await api.get("/admin/rbac/assets", { params });

    return res.data;
  },

  getAssetById: async (id: number): Promise<Asset> => {
    const res: AxiosResponse<Asset> = await api.get(`/admin/rbac/assets/${id}`);
    return res.data;
  },

  createAsset: async (payload: CreateAssetDto): Promise<Asset> => {
    const res: AxiosResponse<Asset> = await api.post("/admin/rbac/assets", payload);
    return res.data;
  },

  updateAsset: async (id: number, payload: UpdateAssetDto): Promise<Asset> => {
    const res: AxiosResponse<Asset> = await api.put(`/admin/rbac/assets/${id}`, payload);
    return res.data;
  },

  deleteAsset: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/assets/${id}`);
  },

  getRolePermissionsForAsset: async (assetId: number): Promise<RolePermission[]> => {
    const res: AxiosResponse<RolePermission[]> = await api.get(`/admin/rbac/assets/${assetId}/role-permissions`);
    return res.data;
  },
};
