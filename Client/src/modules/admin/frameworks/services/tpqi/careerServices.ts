import api from "@Services/api";
import { Career, CareerPageResult, UpdateCareerDto, CreateCareerDto } from "modules/admin/frameworks/types/tpqi/careerTypes";

const BASE_URL = "/admin/tpqi/career";

export const CareerService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<CareerPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<CareerPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Career>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateCareerDto) {
    const res = await api.post<Career>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateCareerDto) {
    const res = await api.put<Career>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
