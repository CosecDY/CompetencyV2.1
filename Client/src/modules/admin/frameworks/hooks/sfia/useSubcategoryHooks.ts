import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubcategoryService } from "modules/admin/frameworks/services/sfia/subcategoryServices";
import { Subcategory, CreateSubcategoryDto, UpdateSubcategoryDto, SubcategoryPageResult } from "modules/admin/frameworks/types/sfia/subcategoryTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSubcategoryManager(
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

  // ฟังก์ชัน fetchPage ที่ใช้เรียก API หนึ่งครั้งเดียว
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Subcategory[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await SubcategoryService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch หลายหน้าแรก (ใช้ fetchPage)
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["subcategories", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // โหลดหน้าปัจจุบัน ถ้าอยู่นอก prefetch
  const currentPageQuery = useQuery<SubcategoryPageResult, Error>({
    queryKey: ["subcategories", search, page, perPage],
    queryFn: () => SubcategoryService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  // รวมข้อมูล prefetch กับหน้าปัจจุบัน
  const mergedData: SubcategoryPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) return pre.data;
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const subcategoryQuery = useQuery<Subcategory, Error>({
    queryKey: ["subcategory", id],
    queryFn: () => {
      if (id === null) throw new Error("Subcategory id is null");
      return SubcategoryService.getById(id);
    },
    enabled: id !== null,
  });

  const createSubcategory = useMutation<Subcategory, Error, CreateSubcategoryDto>({
    mutationFn: (dto) => SubcategoryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      onToast?.("Subcategory created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create subcategory", "error");
    },
  });

  const updateSubcategory = useMutation<Subcategory, Error, { id: number; data: UpdateSubcategoryDto }>({
    mutationFn: ({ id, data }) => SubcategoryService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["subcategory", updated.id] });
      onToast?.("Subcategory updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update subcategory", "error");
    },
  });

  const deleteSubcategory = useMutation<void, Error, number>({
    mutationFn: (delId) => SubcategoryService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      onToast?.("Subcategory deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete subcategory", "error");
    },
  });

  return {
    subcategoriesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    subcategoryQuery,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  };
}
