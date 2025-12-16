import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitOccupationalService } from "modules/admin/frameworks/services/tpqi/unitOccupationalServices";
import { UnitOccupational, UnitOccupationalPageResult, UnitOccupationalView, CreateucOccupationalDto, UpdateucOccupationalDto } from "modules/admin/frameworks/types/tpqi/unitOccupationalTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUnitOccupationalManager(
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
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UnitOccupationalView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UnitOccupationalService.getAll(search, pageNumber, pageSize);
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
  const currentPageQuery = useQuery<UnitOccupationalPageResult, Error>({
    queryKey: ["careerKnowledge", "list", search, page, perPage],
    queryFn: async () => {
      const res = await UnitOccupationalService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: UnitOccupationalPageResult | undefined = (() => {
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

  const unitOccupationalQuery = useQuery<UnitOccupational, Error>({
    queryKey: ["unitOccupational", "detail", id],
    queryFn: async () => {
      if (id) {
        const res = await UnitOccupationalService.getById(id);
        return res;
      }
      throw new Error("UnitOccupational ID is required");
    },
    enabled: id !== null,
  });

  const createUnitOccupational = useMutation({
    mutationFn: (data: CreateucOccupationalDto) => UnitOccupationalService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unitOccupational", "list"] });
      onToast?.("UnitOccupational created successfully", "success");
    },
  });

  const updateUnitOccupational = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateucOccupationalDto }) => UnitOccupationalService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unitOccupational", "list"] });
      queryClient.invalidateQueries({ queryKey: ["unitOccupational", "detail", id] });
      onToast?.("UnitOccupational updated successfully", "success");
    },
  });

  const deleteUnitOccupational = useMutation({
    mutationFn: (id: number) => UnitOccupationalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitOccupational", "list"] });
      onToast?.("UnitOccupational deleted successfully", "success");
    },
  });

  return {
    unitOccupationalsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    unitOccupationalQuery,
    createUnitOccupational,
    updateUnitOccupational,
    deleteUnitOccupational,
    fetchPage,
  };
}
