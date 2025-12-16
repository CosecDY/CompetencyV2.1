import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserSkillService } from "modules/admin/frameworks/services/tpqi/userSkillServices";
import { UserSkill, UserSkillPageResult, UpdateUserSkillDto } from "modules/admin/frameworks/types/tpqi/userSkillTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUserSkillManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UserSkill[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UserSkillService.getAll(search, pageNumber, pageSize);
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
  const currentPageQuery = useQuery<UserSkillPageResult, Error>({
    queryKey: ["userSkill", "list", search, page, perPage],
    queryFn: () => UserSkillService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: UserSkillPageResult | undefined = (() => {
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

  // Single item
  const userSkillQuery = useQuery<UserSkill, Error>({
    queryKey: ["userSkill", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("UserSkill ID is required");
      return UserSkillService.getById(id);
    },
    enabled: id !== null,
  });

  // Update
  const updateUserSkill = useMutation<UserSkill, Error, { id: number; data: UpdateUserSkillDto }>({
    mutationFn: ({ id, data }) => UserSkillService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["userSkill"] });
      queryClient.invalidateQueries({ queryKey: ["userSkill", "item", updated.id] });
      onToast?.("UserSkill updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update UserSkill: ${err.message}`, "error"),
  });

  return {
    userSkillsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    userSkillQuery,
    updateUserSkill,
    fetchPage,
  };
}
