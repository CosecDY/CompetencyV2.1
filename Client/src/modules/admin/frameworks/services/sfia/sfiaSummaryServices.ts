import api from "@Services/api";
import { SFIASummary, SFIASummaryPageResult } from "modules/admin/frameworks/types/sfia/sfiaSummaryTypes";

const BASE_URL = "/admin/sfia/summary-data";

export const SFIASummarySercice = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SFIASummaryPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<SFIASummaryPageResult>(`${BASE_URL}?${params.toString()}`);

    return res.data;
  },

  async getById(id: number): Promise<SFIASummary> {
    const res = await api.get<SFIASummary>(`${BASE_URL}/${id}`);
    return res.data;
  },
};
