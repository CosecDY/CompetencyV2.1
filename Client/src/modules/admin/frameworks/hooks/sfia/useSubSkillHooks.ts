import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubSkillService } from "modules/admin/frameworks/services/sfia/subSkillServices";
import { SubSkill, CreateSubSkillDto, UpdateSubSkillDto, SubSkillPageResult } from "modules/admin/frameworks/types/sfia/subSkillTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSubSkillManager(
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

  // unified fetcher (for prefetch + table)
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: SubSkill[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await SubSkillService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["subskills", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // current page (outside prefetch window)
  const currentPageQuery = useQuery<SubSkillPageResult, Error>({
    queryKey: ["subskills", search, page, perPage],
    queryFn: () => SubSkillService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // merge prefetched vs current
  const mergedData: SubSkillPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) return pre.data as SubSkillPageResult;
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // one subskill
  const subSkillQuery = useQuery<SubSkill, Error>({
    queryKey: ["subskill", id],
    queryFn: () => {
      if (id === null) throw new Error("SubSkill id is null");
      return SubSkillService.getById(id);
    },
    enabled: id !== null,
  });

  // create
  const createSubSkill = useMutation<SubSkill, Error, CreateSubSkillDto>({
    mutationFn: (dto) => SubSkillService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subskills"] });
      onToast?.("Sub-skill created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create sub-skill", "error");
    },
  });

  // update
  const updateSubSkill = useMutation<SubSkill, Error, { id: number; data: UpdateSubSkillDto }>({
    mutationFn: ({ id, data }) => SubSkillService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["subskills"] });
      queryClient.invalidateQueries({ queryKey: ["subskill", updated.id] });
      onToast?.("Sub-skill updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update sub-skill", "error");
    },
  });

  // delete
  const deleteSubSkill = useMutation<void, Error, number>({
    mutationFn: (delId) => SubSkillService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subskills"] });
      onToast?.("Sub-skill deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete sub-skill", "error");
    },
  });

  return {
    subSkillsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    subSkillQuery,
    createSubSkill,
    updateSubSkill,
    deleteSubSkill,
  };
}
