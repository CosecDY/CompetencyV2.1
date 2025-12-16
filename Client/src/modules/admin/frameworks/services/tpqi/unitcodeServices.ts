import api from "@Services/api";
import { UnitCode, UnitCodePageResult, UpdateUnitCodeDto, CreateUnitCodeDto } from "modules/admin/frameworks/types/tpqi/unitCodeTypes";

const BASE_URL = "/admin/tpqi/unit-code";

export const UnitCodeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UnitCodePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<UnitCodePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UnitCode>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateUnitCodeDto) {
    const res = await api.post<UnitCode>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateUnitCodeDto) {
    const res = await api.put<UnitCode>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
