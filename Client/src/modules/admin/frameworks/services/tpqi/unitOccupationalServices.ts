import api from "@Services/api";
import { UnitOccupational, UnitOccupationalPageResult, CreateucOccupationalDto, UpdateucOccupationalDto } from "modules/admin/frameworks/types/tpqi/unitOccupationalTypes";

const BASE_URL = "/admin/tpqi/unit-occupational";

export const UnitOccupationalService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UnitOccupationalPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<UnitOccupationalPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UnitOccupational>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateucOccupationalDto) {
    const res = await api.post<UnitOccupational>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateucOccupationalDto) {
    const res = await api.put<UnitOccupational>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
