import api from "@Services/api";
import { Subcategory, CreateSubcategoryDto, UpdateSubcategoryDto, SubcategoryPageResult } from "modules/admin/frameworks/types/sfia/subcategoryTypes";

const BASE_URL = "/admin/sfia/subcategory";

export const SubcategoryService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<SubcategoryPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);
    const res = await api.get<SubcategoryPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<Subcategory>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateSubcategoryDto) {
    const res = await api.post<Subcategory>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateSubcategoryDto) {
    const res = await api.put<Subcategory>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
