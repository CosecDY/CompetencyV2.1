import api from "@Services/api";
import { UserKnowledge, UserKnowledgePageResult, UpdateUserKnowledgeDto } from "modules/admin/frameworks/types/tpqi/userKnowledgeTypes";

const BASE_URL = "/admin/tpqi/users-knowledge";

export const UserKnowledgeService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<UserKnowledgePageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<UserKnowledgePageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<UserKnowledge>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async update(id: number, data: UpdateUserKnowledgeDto) {
    const res = await api.put<UserKnowledge>(`${BASE_URL}/${id}`, data);
    return res.data;
  },
};
