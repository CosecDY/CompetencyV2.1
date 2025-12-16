import api from "@Services/api";
import { ClUnitCode, ClUnitCodePageResult, CreateClUnitCodeDto, UpdateClUnitCodeDto } from "modules/admin/frameworks/types/tpqi/clUnitCodeTypes";

const BASE_URL = "/admin/tpqi/cl-uc";

export const ClUnitCodeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<ClUnitCodePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<ClUnitCodePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<ClUnitCode>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateClUnitCodeDto) {
    const res = await api.post<ClUnitCode>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateClUnitCodeDto) {
    const res = await api.put<ClUnitCode>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
