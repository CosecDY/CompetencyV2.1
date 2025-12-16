export interface Category {
  id: number;
  name?: string | null;
  subcategoryId?: number | null;
}

export interface CategoryPageResult {
  data: Category[];
  total?: number;
}

export type CreateCategoryDto = Omit<Category, "id">;
export type UpdateCategoryDto = Partial<Omit<Category, "id">>;
