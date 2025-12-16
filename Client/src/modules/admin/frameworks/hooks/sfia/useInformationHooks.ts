import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { InformationService } from "modules/admin/frameworks/services/sfia/informationServices";
import { Information, InformationPageResult, UpdateInformationDto } from "modules/admin/frameworks/types/sfia/informationTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useInformationManager(
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

  // ---------- Paging fetcher for DataTable ----------
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Information[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await InformationService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // ---------- Prefetch a few pages for snappy nav ----------
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["information", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // ---------- Load current page if beyond prefetch range ----------
  const currentPageQuery = useQuery<InformationPageResult, Error>({
    queryKey: ["information", "list", search, page, perPage],
    queryFn: () => InformationService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // ---------- Merge data from prefetch/current page ----------
  const mergedData: InformationPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) {
        const preData = pre.data as { data: Information[]; total: number } | undefined;
        if (preData) return { data: preData.data, total: preData.total };
      }
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = (prefetchQueries.find((q) => q.error)?.error as Error | undefined) || (page > initialPrefetchPages ? currentPageQuery.error : undefined);

  // ---------- Single item query ----------
  const informationItemQuery = useQuery<Information, Error>({
    queryKey: ["information", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("Information ID is required");
      return InformationService.getById(id);
    },
    enabled: id !== null,
  });

  const updateInformation = useMutation<Information, Error, { id: number; data: UpdateInformationDto }>({
    mutationFn: ({ id, data }) => InformationService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["information"] });
      queryClient.invalidateQueries({ queryKey: ["information", "item", updated.id] });
      onToast?.("Information updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update Information: ${err.message}`, "error"),
  });

  return {
    // List (paged)
    informationListQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    informationItemQuery,
    updateInformation,
    fetchPage,
  };
}
