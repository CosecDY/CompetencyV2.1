import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClSkillService } from "modules/admin/frameworks/services/tpqi/clSkillServices";
import { ClSkill, ClSkillPageResult, ClSkillView, CreateClSkillDto, UpdateClSkillDto } from "modules/admin/frameworks/types/tpqi/clSkillTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useCLSkillManager(
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
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: ClSkillView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await ClSkillService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["careerSkill", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Load the current page if beyond prefetch range
  const currentPageQuery = useQuery<ClSkillPageResult, Error>({
    queryKey: ["careerSkill", "list", search, page, perPage],
    queryFn: async () => {
      const res = await ClSkillService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: ClSkillPageResult | undefined = (() => {
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
  const clSkillQuery = useQuery<ClSkill, Error>({
    queryKey: ["careerSkill", "item", id],
    queryFn: () => {
      if (id === null) throw new Error("CareerSkill ID is required");
      return ClSkillService.getById(id);
    },
    enabled: id !== null,
  });

  // Create
  const createClSkill = useMutation<ClSkill, Error, CreateClSkillDto>({
    mutationFn: (dto) => ClSkillService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerSkill"] });
      onToast?.("CareerSkill created successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to create CareerSkill: ${err.message}`, "error"),
  });

  // Update
  const updateClSkill = useMutation<ClSkill, Error, { id: number; data: UpdateClSkillDto }>({
    mutationFn: ({ id, data }) => ClSkillService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["careerSkill"] });
      queryClient.invalidateQueries({ queryKey: ["careerSkill", "item", updated.id] });
      onToast?.("CareerSkill updated successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to update CareerSkill: ${err.message}`, "error"),
  });

  // Delete
  const deleteClSkill = useMutation<void, Error, number>({
    mutationFn: (delId) => ClSkillService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerSkill"] });
      onToast?.("CareerSkill deleted successfully", "success");
    },
    onError: (err) => onToast?.(`Failed to delete CareerSkill: ${err.message}`, "error"),
  });

  return {
    clSkillsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    clSkillQuery,
    createClSkill,
    updateClSkill,
    deleteClSkill,
    fetchPage,
  };
}
