import api from "@Services/api";
import { Knowledge, KnowledgePageResult, UpdateKnowledgeDto, CreateKnowledgeDto } from "modules/admin/frameworks/types/tpqi/knowledgeTypes";

const BASE_URL = "/admin/tpqi/knowledge";

export const KnowledgeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<KnowledgePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<KnowledgePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Knowledge>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateKnowledgeDto) {
    const res = await api.post<Knowledge>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateKnowledgeDto) {
    const res = await api.put<Knowledge>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
