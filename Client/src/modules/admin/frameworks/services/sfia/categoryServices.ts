import api from "@Services/api";
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryPageResult } from "modules/admin/frameworks/types/sfia/categoryTypes";

const BASE_URL = "/admin/sfia/category";

export const CategoryService = {
  async getAll(search?: string, cursor?: number, perPage?: number): Promise<CategoryPageResult> {
    const params = new URLSearchParams();
    if (cursor) params.append("page", String(cursor));
    if (perPage) params.append("perPage", String(perPage));
    if (search) params.append("search", search);

    const res = await api.get<CategoryPageResult>(`${BASE_URL}?${params.toString()}`);
    return res.data;
  },

  async getById(id: number): Promise<Category> {
    const res = await api.get<Category>(`${BASE_URL}/${id}`);
    return res.data;
  },

  async create(data: CreateCategoryDto): Promise<Category> {
    const res = await api.post<Category>(BASE_URL, data);
    return res.data;
  },

  async update(id: number, data: UpdateCategoryDto): Promise<Category> {
    const res = await api.put<Category>(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${BASE_URL}/${id}`);
  },
};
