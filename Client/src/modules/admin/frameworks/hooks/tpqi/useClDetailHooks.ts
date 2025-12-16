import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClDetailService } from "modules/admin/frameworks/services/tpqi/clDetailServices";
import { ClDetail, ClDetailPageResult, CreateClDetailDto, UpdateClDetailDto } from "modules/admin/frameworks/types/tpqi/clDetailTypes";
import { on } from "events";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useClDetailManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: ClDetail[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await ClDetailService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["careerDetail", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<ClDetailPageResult, Error>({
    queryKey: ["careerDetail", "list", search, page, perPage],
    queryFn: async () => {
      const res = await ClDetailService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: ClDetailPageResult | undefined = (() => {
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

  const clDetailQuery = useQuery<ClDetail, Error>({
    queryKey: ["careerDetail", "item", id],
    queryFn: async () => {
      if (id === null) throw new Error("Invalid ID");
      const res = await ClDetailService.getById(id);
      return res;
    },
    enabled: id !== null,
  });

  const createClDetail = useMutation({
    mutationFn: (data: CreateClDetailDto) => ClDetailService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["careerDetail", "list"] });
      onToast?.("Career Level Detail created successfully", "success");
      return data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to create Career Level Detail";
      onToast?.(message, "error");
    },
  });

  const updateClDetail = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClDetailDto }) => ClDetailService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["careerDetail"] });
      onToast?.("Career Level Detail updated successfully", "success");
      return data;
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to update Career Level Detail";
      onToast?.(message, "error");
    },
  });

  const deleteClDetail = useMutation({
    mutationFn: (id: number) => ClDetailService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerDetail", "list"] });
      onToast?.("Career Level Detail deleted successfully", "success");
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to delete Career Level Detail";
      onToast?.(message, "error");
    },
  });
  return {
    clDetailsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    clDetailQuery,
    createClDetail,
    updateClDetail,
    deleteClDetail,
    fetchPage,
  };
}
