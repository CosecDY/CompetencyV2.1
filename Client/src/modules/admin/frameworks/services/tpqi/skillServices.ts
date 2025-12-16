import api from "@Services/api";
import { Skill, SkillPageResult, UpdateSkillDto, CreateSkillDto } from "modules/admin/frameworks/types/tpqi/skillTypes";

const BASE_URL = "/admin/tpqi/skill";

export const SkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<SkillPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Skill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateSkillDto) {
    const res = await api.post<Skill>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateSkillDto) {
    const res = await api.put<Skill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
