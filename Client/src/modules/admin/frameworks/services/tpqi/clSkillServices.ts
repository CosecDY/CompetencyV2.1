import api from "@Services/api";
import { ClSkill, ClSkillPageResult, CreateClSkillDto, UpdateClSkillDto } from "modules/admin/frameworks/types/tpqi/clSkillTypes";

const BASE_URL = "/admin/tpqi/cl-skills";

export const ClSkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<ClSkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<ClSkillPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<ClSkill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateClSkillDto) {
    const res = await api.post<ClSkill>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateClSkillDto) {
    const res = await api.put<ClSkill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
