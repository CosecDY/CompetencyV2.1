import api from "@Services/api";
import { ClKnowledge, ClKnowledgePageResult, CreateClKnowledgeDto, UpdateClKnowledgeDto } from "modules/admin/frameworks/types/tpqi/clKnowledgeTypes";

const BASE_URL = "/admin/tpqi/cl-knowledge";

export const ClKnowledgeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<ClKnowledgePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<ClKnowledgePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<ClKnowledge>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateClKnowledgeDto) {
    const res = await api.post<ClKnowledge>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateClKnowledgeDto) {
    const res = await api.put<ClKnowledge>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
