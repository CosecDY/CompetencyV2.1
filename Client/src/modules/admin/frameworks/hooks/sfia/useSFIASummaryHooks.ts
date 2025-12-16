import { useQuery, useQueries } from "@tanstack/react-query";
import { SFIASummarySercice } from "modules/admin/frameworks/services/sfia/sfiaSummaryServices";
import { SFIASummary, SFIASummaryPageResult } from "modules/admin/frameworks/types/sfia/sfiaSummaryTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSFIASummaryManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: SFIASummary[]; total: number }> => {
    try {
      const pageNumber = pageIndex + 1;
      const result = await SFIASummarySercice.getAll(search, pageNumber, pageSize);
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

  const currentPageQuery = useQuery<SFIASummaryPageResult, Error>({
    queryKey: ["TPQISummary", search, page, perPage],
    queryFn: async () => {
      try {
        return await SFIASummarySercice.getAll(search, page, perPage);
      } catch (err: any) {
        onToast?.(`Failed to fetch TPQI summaries: ${err.message || "Unknown error"}`, "error");
        throw err;
      }
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: SFIASummaryPageResult | undefined = (() => {
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

  const tpqiSummaryQuery = useQuery<SFIASummary | undefined, Error>({
    queryKey: ["SFIASummary", id],
    queryFn: async () => {
      if (id === null) return Promise.resolve(undefined);
      try {
        return await SFIASummarySercice.getById(id);
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
