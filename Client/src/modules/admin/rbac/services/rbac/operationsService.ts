import { AxiosResponse } from "axios";
import api from "@Services/api";
import { Operation, OperationPageResult } from "modules/admin/rbac/types/operationTypes";

export const OperationsService = {
  getAllOperations: async (page?: number, perPage?: number): Promise<OperationPageResult> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));

    const res: AxiosResponse<OperationPageResult> = await api.get("/admin/rbac/operations", { params });
    return res.data;
  },

  getOperationById: async (id: number): Promise<Operation> => {
    const res: AxiosResponse<Operation> = await api.get(`/admin/rbac/operations/${id}`);
    return res.data;
  },

  createOperation: async (payload: Operation): Promise<Operation> => {
    const res: AxiosResponse<Operation> = await api.post("/admin/rbac/operations", payload);
    return res.data;
  },

  updateOperation: async (id: number, payload: Partial<Operation>): Promise<Operation> => {
    const res: AxiosResponse<Operation> = await api.put(`/admin/rbac/operations/${id}`, payload);
    return res.data;
  },

  deleteOperation: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/operations/${id}`);
  },
};
