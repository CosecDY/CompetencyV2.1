import api from "@Services/api";
import { ClDetail, ClDetailPageResult, CreateClDetailDto, UpdateClDetailDto } from "modules/admin/frameworks/types/tpqi/clDetailTypes";

const BASE_URL = "/admin/tpqi/details";

export const ClDetailService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<ClDetailPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<ClDetailPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<ClDetail>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateClDetailDto) {
    const res = await api.post<ClDetail>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateClDetailDto) {
    const res = await api.put<ClDetail>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
