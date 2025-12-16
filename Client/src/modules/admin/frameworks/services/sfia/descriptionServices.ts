import api from "@Services/api";
import { Description, CreateDescriptionDto, UpdateDescriptionDto, DescriptionPageResult } from "modules/admin/frameworks/types/sfia/descriptionTypes";

const BASE_URL = "/admin/sfia/description";

export const DescriptionService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<DescriptionPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<DescriptionPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number): Promise<Description> {
    const res = await api.get<Description>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateDescriptionDto): Promise<Description> {
    const res = await api.post<Description>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateDescriptionDto): Promise<Description> {
    const res = await api.put<Description>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
