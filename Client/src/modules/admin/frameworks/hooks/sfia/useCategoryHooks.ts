import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { CategoryService } from "modules/admin/frameworks/services/sfia/categoryServices";
import { Category, CreateCategoryDto, UpdateCategoryDto, CategoryPageResult } from "modules/admin/frameworks/types/sfia/categoryTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useCategoryManager(
  options?: {
    id?: number | null;
    search?: string;
    page?: number;
    perPage?: number;
    initialPrefetchPages?: number;
  },
  onToast?: ToastCallback
) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Category[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await CategoryService.getAll(search, pageNumber, pageSize);

    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch หลายหน้าแรก
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["categories", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // โหลดหน้าปัจจุบัน
  const currentPageQuery = useQuery<CategoryPageResult, Error>({
    queryKey: ["categories", search, page, perPage] as const,
    queryFn: () => CategoryService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // รวมข้อมูล prefetch กับหน้าปัจจุบัน
  const mergedData: CategoryPageResult | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // ดึงข้อมูลเดี่ยว
  const categoryQuery = useQuery<Category, Error>({
    queryKey: ["category", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Category id is null");
      return CategoryService.getById(id);
    },
    enabled: id !== null,
  });

  // Mutation: create
  const createCategory = useMutation<Category, Error, CreateCategoryDto>({
    mutationFn: (dto) => CategoryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onToast?.("Category created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create category", "error");
    },
  });

  // Mutation: update
  const updateCategory = useMutation<Category, Error, { id: number; data: UpdateCategoryDto }>({
    mutationFn: ({ id, data }) => CategoryService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", updated.id] });
      onToast?.("Category updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update category", "error");
    },
  });

  // Mutation: delete
  const deleteCategory = useMutation<void, Error, number>({
    mutationFn: (delId) => CategoryService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onToast?.("Category deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete category", "error");
    },
  });

  return {
    categoriesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    categoryQuery,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
