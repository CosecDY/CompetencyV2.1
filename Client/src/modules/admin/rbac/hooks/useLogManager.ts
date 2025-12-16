import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { LogsService } from "modules/admin/rbac/services/rbac/logsService";
import { Log, LogPageResult } from "modules/admin/rbac/types/logTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useLogManager(options?: { id?: number | null; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // ฟังก์ชัน fetch หน้าของ logs
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Log[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result: LogPageResult = await LogsService.getAllLogs(pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch สำหรับหลายหน้า
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["logs", i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // query ปัจจุบัน
  const currentPageQuery = useQuery<LogPageResult, Error>({
    queryKey: ["logs", page, perPage] as const,
    queryFn: () => LogsService.getAllLogs(page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // merged data
  const mergedData: LogPageResult | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // query log by id
  const logQuery = useQuery<Log, Error>({
    queryKey: ["log", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Log id is null");
      return LogsService.getLogById(id);
    },
    enabled: id !== null,
  });

  // mutation delete log
  const deleteLog = useMutation<void, Error, number>({
    mutationFn: (logId: number) => LogsService.deleteLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      onToast?.("Log deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete log", "error"),
  });

  return {
    logsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    logQuery,
    deleteLog,
  };
}
