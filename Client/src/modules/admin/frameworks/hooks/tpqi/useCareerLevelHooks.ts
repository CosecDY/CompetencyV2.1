import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { CareerLevelService } from "modules/admin/frameworks/services/tpqi/careerLevelServices";
import { CareerLevelView, CareerLevel, CreateCareerLevelDto, UpdateCareerLevelDto, CareerLevelPageResult } from "modules/admin/frameworks/types/tpqi/careerLevelTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useCareerLevelManager(
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

  // Fetch a single page
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: CareerLevelView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await CareerLevelService.getAll(search, pageNumber, pageSize);

    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["careerLevel", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Load current page if beyond prefetch range
  const currentPageQuery = useQuery<CareerLevelPageResult, Error>({
    queryKey: ["careerLevel", "list", search, page, perPage],
    queryFn: async () => {
      const res = await CareerLevelService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: CareerLevelPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) {
        const d = pre.data as { data: any[]; total: number } | undefined;
        if (d) return { data: d.data, total: d.total };
      }
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // Single item
  const careerLevelQuery = useQuery<CareerLevel, Error>({
    queryKey: ["careerLevel", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("CareerLevel ID is required");
      return CareerLevelService.getById(id);
    },
    enabled: id !== null,
  });

  // Create
  const createCareerLevel = useMutation<CareerLevel, Error, CreateCareerLevelDto>({
    mutationFn: (dto) => CareerLevelService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerLevel"] });
      onToast?.("CareerLevel created successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to create CareerLevel: ${err.message}`, "error"),
  });

  // Update
  const updateCareerLevel = useMutation<CareerLevel, Error, { id: number; data: UpdateCareerLevelDto }>({
    mutationFn: ({ id, data }) => CareerLevelService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["careerLevel"] });
      queryClient.invalidateQueries({ queryKey: ["careerLevel", "item", updated.id] });
      onToast?.("CareerLevel updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update CareerLevel: ${err.message}`, "error"),
  });

  // Delete
  const deleteCareerLevel = useMutation<void, Error, number>({
    mutationFn: (delId) => CareerLevelService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerLevel"] });
      onToast?.("CareerLevel deleted successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to delete CareerLevel: ${err.message}`, "error"),
  });

  return {
    careerLevelsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    careerLevelQuery,
    createCareerLevel,
    updateCareerLevel,
    deleteCareerLevel,
    fetchPage,
  };
}
