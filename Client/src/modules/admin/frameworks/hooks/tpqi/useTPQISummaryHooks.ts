import { useQuery, useQueries } from "@tanstack/react-query";
import { TPQISummaryService } from "modules/admin/frameworks/services/tpqi/tpqiSummaryServices";
import { TPQISummary, TPQISummaryPageResult } from "modules/admin/frameworks/types/tpqi/tpqiSummaryTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useTPQISummaryManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: TPQISummary[]; total: number }> => {
    try {
      const pageNumber = pageIndex + 1;
      const result = await TPQISummaryService.getAll(search, pageNumber, pageSize);
      return {
        data: result.data ?? [],
        total: result.total ?? 0,
      };
    } catch (err: any) {
      onToast?.(`Failed to fetch TPQI summaries: ${err.message || "Unknown error"}`, "error");
      throw err;
    }
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["TPQISummary", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<TPQISummaryPageResult, Error>({
    queryKey: ["TPQISummary", search, page, perPage],
    queryFn: async () => {
      try {
        return await TPQISummaryService.getAll(search, page, perPage);
      } catch (err: any) {
        onToast?.(`Failed to fetch TPQI summaries: ${err.message || "Unknown error"}`, "error");
        throw err;
      }
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: TPQISummaryPageResult | undefined = (() => {
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

  const tpqiSummaryQuery = useQuery<TPQISummary | undefined, Error>({
    queryKey: ["TPQISummary", id],
    queryFn: async () => {
      if (id === null) return Promise.resolve(undefined);
      try {
        return await TPQISummaryService.getById(id);
      } catch (err: any) {
        onToast?.(`Failed to fetch TPQI summary with id ${id}: ${err.message || "Unknown error"}`, "error");
        throw err;
      }
    },
    enabled: id !== null,
  });

  return {
    tpqiSummariesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    tpqiSummaryQuery,
    fetchPage,
  };
}
