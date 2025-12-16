import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitSkillService } from "modules/admin/frameworks/services/tpqi/unitSkillServices";
import { UnitSkill, UnitSkillPageResult, UnitSkillView, CreateUnitSkillDto, UpdateUnitSkillDto } from "modules/admin/frameworks/types/tpqi/unitSkillTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUnitSkillManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UnitSkillView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UnitSkillService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["unitSkill", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<UnitSkillPageResult, Error>({
    queryKey: ["unitSkill", "list", search, page, perPage],
    queryFn: async () => UnitSkillService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: UnitSkillPageResult | undefined = (() => {
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

  const unitSkillQuery = useQuery<UnitSkill, Error>({
    queryKey: ["unitSkill", "detail", id],
    queryFn: async () => {
      if (id) return UnitSkillService.getById(id);
      throw new Error("UnitSkill ID is required");
    },
    enabled: id !== null,
  });

  const createUnitSkill = useMutation({
    mutationFn: (data: CreateUnitSkillDto) => UnitSkillService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitSkill", "list"] });
      onToast?.("UnitSkill created successfully", "success");
    },
  });

  const updateUnitSkill = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitSkillDto }) => UnitSkillService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unitSkill", "list"] });
      queryClient.invalidateQueries({ queryKey: ["unitSkill", "detail", variables.id] });
      onToast?.("UnitSkill updated successfully", "success");
    },
  });

  const deleteUnitSkill = useMutation({
    mutationFn: (id: number) => UnitSkillService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitSkill", "list"] });
      onToast?.("UnitSkill deleted successfully", "success");
    },
  });

  return {
    unitSkillsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    unitSkillQuery,
    createUnitSkill,
    updateUnitSkill,
    deleteUnitSkill,
    fetchPage,
  };
}
