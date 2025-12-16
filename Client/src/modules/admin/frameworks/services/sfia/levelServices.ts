import api from "@Services/api";
import { Level, CreateLevelDto, UpdateLevelDto, LevelPageResult } from "modules/admin/frameworks/types/sfia/levelTypes";

const BASE_URL = "/admin/sfia/level";

export const LevelService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<LevelPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<LevelPageResult>(`${BASE_URL}?${params.toString()}`);

    return res.data;
  },

  async getById(id: number): Promise<Level> {
    const res = await api.get<Level>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateLevelDto): Promise<Level> {
    const res = await api.post<Level>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateLevelDto): Promise<Level> {
    const res = await api.put<Level>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
