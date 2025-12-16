import api from "@Services/api";
import { Occupational, OccupationalPageResult, UpdateOccupationalDto, CreateOccupationalDto } from "modules/admin/frameworks/types/tpqi/occupationalTypes";

const BASE_URL = "/admin/tpqi/occupational";

export const OccupationalService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<OccupationalPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<OccupationalPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Occupational>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateOccupationalDto) {
    const res = await api.post<Occupational>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateOccupationalDto) {
    const res = await api.put<Occupational>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
