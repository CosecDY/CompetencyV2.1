import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { LevelService } from "modules/admin/frameworks/services/tpqi/levelServices";
import { Level, CreateLevelDto, UpdateLevelDto, LevelPageResult } from "modules/admin/frameworks/types/tpqi/levelTypes";
import { AxiosError } from "axios";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useLevelManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Level[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await LevelService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["levels", search, page, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<LevelPageResult, Error>({
    queryKey: ["levels", search, page, perPage],
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: LevelPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      return {
        data: prefetchQueries.flatMap((q) => q.data?.data || []),
        total: prefetchQueries.reduce((acc, q) => acc + (q.data?.total || 0), 0),
      };
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.isError)?.error || currentPageQuery.error;

  const levelQuery = useQuery<Level | undefined, Error>({
    queryKey: ["level", id],
    queryFn: () => {
      if (id === null) throw new Error("Level id is null");
      return LevelService.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const createLevel = useMutation<Level, unknown, CreateLevelDto>({
    mutationFn: (data) => LevelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      onToast?.("Level created successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to create level", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to create level", "error");
      }
    },
  });

  const updateLevel = useMutation<Level, unknown, { id: number; data: UpdateLevelDto }>({
    mutationFn: ({ id, data }) => LevelService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      onToast?.("Level updated successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to update level", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to update level", "error");
      }
    },
  });

  const deleteLevel = useMutation<void, unknown, number>({
    mutationFn: (id) => LevelService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      onToast?.("Level deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to delete level", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to delete level", "error");
      }
    },
  });

  return {
    levelsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    levelQuery,
    createLevel,
    updateLevel,
    deleteLevel,
  };
}
