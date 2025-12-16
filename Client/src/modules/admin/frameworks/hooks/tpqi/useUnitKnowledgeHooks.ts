import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitKnowledgeService } from "modules/admin/frameworks/services/tpqi/unitKnowledgeServices";
import { UnitKnowledge, UnitKnowledgePageResult, UnitKnowledgeView, CreateUnitKnowledgeDto, UpdateUnitKnowledgeDto } from "modules/admin/frameworks/types/tpqi/unitKnowledgeTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUnitKnowledgeManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UnitKnowledgeView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UnitKnowledgeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["unitKnowledge", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<UnitKnowledgePageResult, Error>({
    queryKey: ["unitKnowledge", "list", search, page, perPage],
    queryFn: async () => UnitKnowledgeService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: UnitKnowledgePageResult | undefined = (() => {
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

  const unitKnowledgeQuery = useQuery<UnitKnowledge, Error>({
    queryKey: ["unitKnowledge", "detail", id],
    queryFn: async () => {
      if (id) return UnitKnowledgeService.getById(id);
      throw new Error("UnitKnowledge ID is required");
    },
    enabled: id !== null,
  });

  const createUnitKnowledge = useMutation({
    mutationFn: (data: CreateUnitKnowledgeDto) => UnitKnowledgeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitKnowledge", "list"] });
      onToast?.("UnitKnowledge created successfully", "success");
    },
  });

  const updateUnitKnowledge = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitKnowledgeDto }) => UnitKnowledgeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unitKnowledge", "list"] });
      queryClient.invalidateQueries({ queryKey: ["unitKnowledge", "detail", variables.id] });
      onToast?.("UnitKnowledge updated successfully", "success");
    },
  });

  const deleteUnitKnowledge = useMutation({
    mutationFn: (id: number) => UnitKnowledgeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitKnowledge", "list"] });
      onToast?.("UnitKnowledge deleted successfully", "success");
    },
  });

  return {
    unitKnowledgesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    unitKnowledgeQuery,
    createUnitKnowledge,
    updateUnitKnowledge,
    deleteUnitKnowledge,
    fetchPage,
  };
}
