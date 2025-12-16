import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitSectorService } from "modules/admin/frameworks/services/tpqi/unitSectorServices";
import { UnitSector, UnitSectorPageResult, UnitSectorView, CreateUnitSectorDto, UpdateUnitSectorDto } from "modules/admin/frameworks/types/tpqi/unitSectorTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUnitSectorManager(
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
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UnitSectorView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UnitSectorService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["unitSector", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<UnitSectorPageResult, Error>({
    queryKey: ["unitSector", "list", search, page, perPage],
    queryFn: async () => {
      const res = await UnitSectorService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // Merge data from prefetch/current page
  const mergedData: UnitSectorPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const prefetchData = prefetchQueries
        .slice(0, initialPrefetchPages)
        .map((q) => q.data)
        .filter((d): d is { data: UnitSectorView[]; total: number } => !!d);
      if (prefetchData.length === initialPrefetchPages) {
        const data = prefetchData.flatMap((d) => d.data);
        const total = prefetchData[0]?.total || 0;
        return { data, total };
      }
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const unitSectorQuery = useQuery<UnitSector, Error>({
    queryKey: ["unitSector", "detail", id],
    queryFn: async () => {
      if (id === null) throw new Error("UnitSector ID is required");
      return UnitSectorService.getById(id);
    },
    enabled: id !== null,
  });

  const createUnitSector = useMutation({
    mutationFn: (data: CreateUnitSectorDto) => UnitSectorService.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unitSector", "list"] });
      onToast?.("Unit Sector created successfully", "success");
    },
    onError: (err: any) => {
      onToast?.(`Failed to create: ${err?.message || ""}`, "error");
    },
  });

  const updateUnitSector = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUnitSectorDto }) => UnitSectorService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["unitSector", "list"] });
      queryClient.invalidateQueries({ queryKey: ["unitSector", "detail", id] });
      onToast?.("Unit Sector updated successfully", "success");
    },
    onError: (err: any) => {
      onToast?.(`Failed to update: ${err?.message || ""}`, "error");
    },
  });

  const deleteUnitSector = useMutation({
    mutationFn: (id: number) => UnitSectorService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unitSector", "list"] });
      onToast?.("Unit Sector deleted successfully", "success");
    },
    onError: (err: any) => {
      onToast?.(`Failed to delete: ${err?.message || ""}`, "error");
    },
  });

  return {
    unitSectorsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    unitSectorQuery,
    createUnitSector,
    updateUnitSector,
    deleteUnitSector,
    fetchPage,
  };
}
