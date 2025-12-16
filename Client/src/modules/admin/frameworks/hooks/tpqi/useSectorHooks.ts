import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { SectorService } from "modules/admin/frameworks/services/tpqi/sectorServices";
import { Sector, CreateSectorDto, UpdateSectorDto, SectorPageResult } from "modules/admin/frameworks/types/tpqi/sectorTypes";
import { AxiosError } from "axios";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSectorManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Sector[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await SectorService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["sectors", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<SectorPageResult, Error>({
    queryKey: ["sectors", search, page, perPage],
    queryFn: () => SectorService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: SectorPageResult | undefined = (() => {
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

  const sectorQuery = useQuery<Sector, Error>({
    queryKey: ["sectors", id],
    queryFn: () => {
      if (id === null) {
        return Promise.reject(new Error("Sector ID is required"));
      }
      return SectorService.getById(id);
    },
    enabled: id !== null,
  });

  const createSector = useMutation<Sector, unknown, CreateSectorDto>({
    mutationFn: (dto) => SectorService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      onToast?.("Sector created successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to create sector", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to create sector", "error");
      }
    },
  });

  const updateSector = useMutation<Sector, unknown, { id: number; data: UpdateSectorDto }>({
    mutationFn: ({ id, data }) => SectorService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      queryClient.invalidateQueries({ queryKey: ["sectors", updated.id] });
      onToast?.("Sector updated successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to update sector", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to update sector", "error");
      }
    },
  });

  const deleteSector = useMutation<void, unknown, number>({
    mutationFn: (delId) => SectorService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sectors"] });
      onToast?.("Sector deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to delete sector", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to delete sector", "error");
      }
    },
  });

  return {
    sectorsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    sectorQuery,
    createSector,
    updateSector,
    deleteSector,
    fetchPage,
  };
}
