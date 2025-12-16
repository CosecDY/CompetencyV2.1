import api from "@Services/api";
import { UnitSkill, UnitSkillPageResult, CreateUnitSkillDto, UpdateUnitSkillDto } from "modules/admin/frameworks/types/tpqi/unitSkillTypes";

const BASE_URL = "/admin/tpqi/unit-skill";

export const UnitSkillService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UnitSkillPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<UnitSkillPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UnitSkill>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateUnitSkillDto) {
    const res = await api.post<UnitSkill>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateUnitSkillDto) {
    const res = await api.put<UnitSkill>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
