import api from "@Services/api";
import { SubSkill, SubSkillPageResult, CreateSubSkillDto, UpdateSubSkillDto } from "modules/admin/frameworks/types/sfia/subSkillTypes";

const BASE_URL = "/admin/sfia/sub-skill";

export const SubSkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SubSkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<SubSkillPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number): Promise<SubSkill> {
    const res = await api.get<SubSkill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateSubSkillDto): Promise<SubSkill> {
    const res = await api.post<SubSkill>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateSubSkillDto): Promise<SubSkill> {
    const res = await api.put<SubSkill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
