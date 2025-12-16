export interface Subcategory {
  id: number;
  name?: string | null;
}

export interface SubcategoryPageResult {
  data: Subcategory[];
  total?: number;
}

export type CreateSubcategoryDto = Omit<Subcategory, "id">;
export type UpdateSubcategoryDto = Partial<Omit<Subcategory, "id">>;
