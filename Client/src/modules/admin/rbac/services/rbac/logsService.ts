import { AxiosResponse } from "axios";
import api from "@Services/api";
import { Log, LogPageResult } from "modules/admin/rbac/types/logTypes";

export const LogsService = {
  getAllLogs: async (page?: number, perPage?: number): Promise<LogPageResult> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append("page", String(page));
    if (perPage !== undefined) params.append("perPage", String(perPage));

    const res: AxiosResponse<LogPageResult> = await api.get("/admin/rbac/logs", { params });
    return res.data;
  },

  getLogById: async (id: number): Promise<Log> => {
    const res: AxiosResponse<Log> = await api.get(`/admin/rbac/logs/${id}`);
    return res.data;
  },

  deleteLog: async (id: number): Promise<void> => {
    await api.delete(`/admin/rbac/logs/${id}`);
  },
};
