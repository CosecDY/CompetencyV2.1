import api from "@Services/api";
import { UserSkill, UserSkillPageResult, UpdateUserSkillDto } from "modules/admin/frameworks/types/tpqi/userSkillTypes";

const BASE_URL = "/admin/tpqi/users-skills";

export const UserSkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UserSkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<UserSkillPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UserSkill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async update(id: number, data: UpdateUserSkillDto) {
    const res = await api.put<UserSkill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
