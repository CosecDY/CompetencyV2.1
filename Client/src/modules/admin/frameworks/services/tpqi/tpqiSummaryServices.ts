import api from "@Services/api";
import { TPQISummary, TPQISummaryPageResult } from "modules/admin/frameworks/types/tpqi/tpqiSummaryTypes";

const BASE_URL = "/admin/tpqi/tpqi-summary-data";

export const TPQISummaryService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<TPQISummaryPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<TPQISummaryPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<TPQISummary>(`${BASE_URL}/${id}`);
    return res.data;
  },
};
