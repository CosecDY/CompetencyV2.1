import { AxiosResponse } from "axios";
import api from "@Services/api";
import { UserAssetInstance, UserAssetInstanceAssignmentDto, UserAssetInstanceListResponse } from "modules/admin/rbac/types/userAssetInstanceTypes";

export const UserAssetInstanceService = {
  // มอบ AssetInstances ให้ user
  assignAssetInstancesToUser: async (payload: UserAssetInstanceAssignmentDto): Promise<UserAssetInstance[]> => {
    const res: AxiosResponse<UserAssetInstance[]> = await api.post("/admin/rbac/user-asset-instances", payload);
    return res.data;
  },

  // ถอน AssetInstance จาก user
  revokeAssetInstanceFromUser: async (userId: string, assetInstanceId: number): Promise<UserAssetInstance> => {
    const res: AxiosResponse<UserAssetInstance> = await api.delete("/admin/rbac/user-asset-instances", {
      data: { userId, assetInstanceId },
    });
    return res.data;
  },

  // ดึงรายการ AssetInstances ของ user
  getUserAssetInstances: async (userId: string): Promise<UserAssetInstance[]> => {
    const res: AxiosResponse<UserAssetInstance[]> = await api.get(`/admin/rbac/user-asset-instances/user/${userId}`);
    return res.data;
  },

  // ดึงรายการทั้งหมด (search + pagination)
  getAllUserAssetInstances: async (params?: { search?: string; page?: number; perPage?: number }): Promise<UserAssetInstanceListResponse> => {
    const res: AxiosResponse<UserAssetInstanceListResponse> = await api.get("/admin/rbac/user-asset-instances", {
      params,
    });
    return res.data;
  },
};
