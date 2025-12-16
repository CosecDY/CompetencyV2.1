import { AxiosResponse } from "axios";
import api from "@Services/api";
import { AssetInstance, CreateAssetInstanceDto, UpdateAssetInstanceDto, AssetPageResult } from "modules/admin/rbac/types/assetInstanceTypes";

export const AssetInstancesService = {
  createInstance: async (payload: CreateAssetInstanceDto): Promise<AssetInstance> => {
    const res: AxiosResponse<AssetInstance> = await api.post("/admin/rbac/asset-instances", payload);
    return res.data;
  },

  deleteInstanceById: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/asset-instances/${id}`);
  },

  deleteInstance: async (payload: { assetId: number; recordId: string }): Promise<void> => {
    await api.delete("/admin/rbac/asset-instances", { data: payload });
  },

  getInstancesByAsset: async (assetId: number): Promise<AssetInstance[]> => {
    const res: AxiosResponse<AssetInstance[]> = await api.get(`/admin/rbac/asset-instances/asset/${assetId}`);
    return res.data;
  },

  getAllInstances: async (): Promise<AssetPageResult> => {
    const res: AxiosResponse<AssetPageResult> = await api.get(`/admin/rbac/asset-instances`);
    return res.data;
  },

  getInstanceById: async (id: number): Promise<AssetInstance> => {
    const res: AxiosResponse<AssetInstance> = await api.get(`/admin/rbac/asset-instances/${id}`);
    return res.data;
  },

  updateInstanceRecord: async (id: number, payload: UpdateAssetInstanceDto): Promise<AssetInstance> => {
    const res: AxiosResponse<AssetInstance> = await api.put(`/admin/rbac/asset-instances/${id}`, payload);
    return res.data;
  },
};
