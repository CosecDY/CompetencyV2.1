import api from "@Services/api";
import { Level, LevelPageResult, UpdateLevelDto, CreateLevelDto } from "modules/admin/frameworks/types/tpqi/levelTypes";

const BASE_URL = "/admin/tpqi/level";

export const LevelService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<LevelPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<LevelPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Level>(`${BASE_URL}/${id}`);
    return res.data;
  },
  async create(data: CreateLevelDto) {
    const res = await api.post<Level>(BASE_URL, data);
    return res.data;
  },
  async update(id: number, data: UpdateLevelDto) {
    const res = await api.put<Level>(`${BASE_URL}/${id}`, data);
    return res.data;
  },
  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
