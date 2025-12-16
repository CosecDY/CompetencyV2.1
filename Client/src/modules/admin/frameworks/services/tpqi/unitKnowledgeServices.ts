import api from "@Services/api";
import { UnitKnowledge, UnitKnowledgePageResult, CreateUnitKnowledgeDto, UpdateUnitKnowledgeDto } from "modules/admin/frameworks/types/tpqi/unitKnowledgeTypes";

const BASE_URL = "/admin/tpqi/unit-knowledge";

export const UnitKnowledgeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UnitKnowledgePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<UnitKnowledgePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UnitKnowledge>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateUnitKnowledgeDto) {
    const res = await api.post<UnitKnowledge>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateUnitKnowledgeDto) {
    const res = await api.put<UnitKnowledge>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
