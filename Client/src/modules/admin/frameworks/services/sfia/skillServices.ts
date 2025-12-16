import api from "@Services/api";
import { Skill, CreateSkillDto, UpdateSkillDto, SkillPageResult } from "modules/admin/frameworks/types/sfia/skillTypes";

const BASE_URL = "/admin/sfia/skill";

export const SkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<SkillPageResult>(`${BASE_URL}?${params.toString()}`);

    return res.data;
  },

  async getById(id: number): Promise<Skill> {
    const res = await api.get<Skill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateSkillDto): Promise<Skill> {
    const res = await api.post<Skill>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateSkillDto): Promise<Skill> {
    const res = await api.put<Skill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
