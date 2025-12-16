import api from "@Services/api";
import { CareerLevel, CareerLevelPageResult, CreateCareerLevelDto, UpdateCareerLevelDto } from "modules/admin/frameworks/types/tpqi/careerLevelTypes";

const BASE_URL = "/admin/tpqi/career-level";

export const CareerLevelService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<CareerLevelPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<CareerLevelPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<CareerLevel>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateCareerLevelDto) {
    const res = await api.post<CareerLevel>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateCareerLevelDto) {
    const res = await api.put<CareerLevel>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
