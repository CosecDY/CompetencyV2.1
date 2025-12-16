import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserKnowledgeService } from "modules/admin/frameworks/services/tpqi/userKnowledgeServices";
import { UserKnowledge, UserKnowledgePageResult, UpdateUserKnowledgeDto } from "modules/admin/frameworks/types/tpqi/userKnowledgeTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUserKnowledgeManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UserKnowledge[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UserKnowledgeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["userSkill", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Load current page if beyond prefetch range
  const currentPageQuery = useQuery<UserKnowledgePageResult, Error>({
    queryKey: ["userSkill", "list", search, page, perPage],
    queryFn: () => UserKnowledgeService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: UserKnowledgePageResult | undefined = (() => {
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

  const userKnowledgeQuery = useQuery<UserKnowledge, Error>({
    queryKey: ["userSkill", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("UserSkill ID is required");
      return UserKnowledgeService.getById(id);
    },
    enabled: id !== null,
  });

  const updateUserKnowledge = useMutation<UserKnowledge, Error, { id: number; data: UpdateUserKnowledgeDto }>({
    mutationFn: ({ id, data }) => UserKnowledgeService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["userSkill"] });
      queryClient.invalidateQueries({ queryKey: ["userSkill", "item", updated.id] });
      onToast?.("UserSkill updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update UserSkill: ${err.message}`, "error"),
  });

  return {
    userKnowledgesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    userKnowledgeQuery,
    updateUserKnowledge,
    fetchPage,
  };
}
