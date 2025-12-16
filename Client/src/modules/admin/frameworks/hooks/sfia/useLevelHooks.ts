import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { LevelService } from "modules/admin/frameworks/services/sfia/levelServices";
import { Level, CreateLevelDto, UpdateLevelDto, LevelPageResult } from "modules/admin/frameworks/types/sfia/levelTypes";

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

  // ฟังก์ชัน fetchPage ใช้ดึงข้อมูลแต่ละหน้า
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Level[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await LevelService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch หลายหน้าแรก
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["levels", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // โหลดหน้าปัจจุบัน ถ้าเกิน prefetch
  const currentPageQuery = useQuery<LevelPageResult, Error>({
    queryKey: ["levels", search, page, perPage] as const,
    queryFn: () => LevelService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // รวมข้อมูลจาก prefetch กับหน้าปัจจุบัน
  const mergedData: LevelPageResult | undefined = (() => {
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

  // ดึงข้อมูลเฉพาะตัวเดียว (useQuery)
  const levelQuery = useQuery<Level, Error>({
    queryKey: ["level", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Level id is null");
      return LevelService.getById(id);
    },
    enabled: id !== null,
  });

  // Mutation: create
  const createLevel = useMutation<Level, Error, CreateLevelDto>({
    mutationFn: (dto) => LevelService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      onToast?.("Level created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create level", "error");
    },
  });

  // Mutation: update
  const updateLevel = useMutation<Level, Error, { id: number; data: UpdateLevelDto }>({
    mutationFn: ({ id, data }) => LevelService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      queryClient.invalidateQueries({ queryKey: ["level", updated.id] });
      onToast?.("Level updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update level", "error");
    },
  });

  // Mutation: delete
  const deleteLevel = useMutation<void, Error, number>({
    mutationFn: (delId) => LevelService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["levels"] });
      onToast?.("Level deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete level", "error");
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
