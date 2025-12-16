import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClKnowledgeService } from "modules/admin/frameworks/services/tpqi/clKnowledgeServices";
import { ClKnowledge, ClKnowledgePageResult, ClKnowledgeView, CreateClKnowledgeDto, UpdateClKnowledgeDto } from "modules/admin/frameworks/types/tpqi/clKnowledgeTypes";
type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useCLKnowledgeManager(
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
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: ClKnowledgeView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await ClKnowledgeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["careerKnowledge", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Load current page if beyond prefetch range
  const currentPageQuery = useQuery<ClKnowledgePageResult, Error>({
    queryKey: ["careerKnowledge", "list", search, page, perPage],
    queryFn: async () => {
      const res = await ClKnowledgeService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: ClKnowledgePageResult | undefined = (() => {
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
  const clKnowledgeQuery = useQuery<ClKnowledge, Error>({
    queryKey: ["careerKnowledge", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("CareerKnowledge ID is required");
      return ClKnowledgeService.getById(id);
    },
    enabled: id !== null,
  });

  // Create
  const createClKnowledge = useMutation<ClKnowledge, Error, CreateClKnowledgeDto>({
    mutationFn: (dto) => ClKnowledgeService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerKnowledge"] });
      onToast?.("CareerKnowledge created successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to create CareerKnowledge: ${err.message}`, "error"),
  });

  // Update
  const updateClKnowledge = useMutation<ClKnowledge, Error, { id: number; data: UpdateClKnowledgeDto }>({
    mutationFn: ({ id, data }) => ClKnowledgeService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["careerKnowledge"] });
      queryClient.invalidateQueries({ queryKey: ["careerKnowledge", "item", updated.id] });
      onToast?.("CareerKnowledge updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update CareerKnowledge: ${err.message}`, "error"),
  });

  // Delete
  const deleteClKnowledge = useMutation<void, Error, number>({
    mutationFn: (delId) => ClKnowledgeService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerKnowledge"] });
      onToast?.("CareerKnowledge deleted successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to delete CareerKnowledge: ${err.message}`, "error"),
  });

  return {
    clKnowledgesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    clKnowledgeQuery,
    createClKnowledge,
    updateClKnowledge,
    deleteClKnowledge,
    fetchPage,
  };
}
