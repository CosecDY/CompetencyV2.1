import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeService } from "modules/admin/frameworks/services/tpqi/knowledgeServices";
import { Knowledge, CreateKnowledgeDto, UpdateKnowledgeDto, KnowledgePageResult } from "modules/admin/frameworks/types/tpqi/knowledgeTypes";
import { AxiosError } from "axios";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useKnowledgeManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Knowledge[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await KnowledgeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["Knowledge", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<KnowledgePageResult, Error>({
    queryKey: ["Knowledge", search, page, perPage],
    queryFn: () => KnowledgeService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: KnowledgePageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) return pre.data;
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.isError)?.error || currentPageQuery.error;

  const knowledgeQuery = useQuery<Knowledge | undefined, Error>({
    queryKey: ["Knowledge", id],
    queryFn: () => {
      if (id === null) throw new Error("knowledge id is null");
      return KnowledgeService.getById(id);
    },
    enabled: !!id,
  });

  const createKnowledge = useMutation<Knowledge, unknown, CreateKnowledgeDto>({
    mutationFn: async (dto) => KnowledgeService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Knowledge"] });
      onToast?.("Knowledge created successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to create knowledge", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to create knowledge", "error");
      }
    },
  });

  const updateKnowledge = useMutation<Knowledge, unknown, { id: number; data: UpdateKnowledgeDto }>({
    mutationFn: async ({ id, data }) => KnowledgeService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["Knowledge"] });
      queryClient.invalidateQueries({ queryKey: ["Knowledge", updated.id] });
      onToast?.("Knowledge updated successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to update knowledge", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to update knowledge", "error");
      }
    },
  });

  const deleteKnowledge = useMutation<void, unknown, number>({
    mutationFn: async (delId) => KnowledgeService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Knowledge"] });
      onToast?.("Knowledge deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to delete knowledge", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to delete knowledge", "error");
      }
    },
  });

  return {
    knowledgesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    knowledgeQuery,
    createKnowledge,
    updateKnowledge,
    deleteKnowledge,
  };
}
