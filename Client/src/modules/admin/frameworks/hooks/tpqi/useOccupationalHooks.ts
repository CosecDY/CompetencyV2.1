import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { OccupationalService } from "modules/admin/frameworks/services/tpqi/occupationalServices";
import { Occupational, CreateOccupationalDto, UpdateOccupationalDto, OccupationalPageResult } from "modules/admin/frameworks/types/tpqi/occupationalTypes";
import { AxiosError } from "axios";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useOccupationalManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Occupational[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await OccupationalService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["occupationals", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<OccupationalPageResult, Error>({
    queryKey: ["occupationals", search, page, perPage],
    queryFn: () => OccupationalService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: OccupationalPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) return pre.data;
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.isError)?.error || currentPageQuery.error;

  const occupationalQuery = useQuery<Occupational, Error>({
    queryKey: ["occupational", id],
    queryFn: () => {
      if (id === null) throw new Error("Occupational id is null");
      return OccupationalService.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const createOccupational = useMutation<Occupational, unknown, CreateOccupationalDto>({
    mutationFn: (dto) => OccupationalService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occupationals"] });
      onToast?.("Occupational created successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to create occupational", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to create occupational", "error");
      }
    },
  });

  const updateOccupational = useMutation<Occupational, unknown, { id: number; data: UpdateOccupationalDto }>({
    mutationFn: ({ id, data }) => OccupationalService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["occupationals"] });
      queryClient.invalidateQueries({ queryKey: ["occupational", updated.id] });
      onToast?.("Occupational updated successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to update occupational", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to update occupational", "error");
      }
    },
  });

  const deleteOccupational = useMutation<void, unknown, number>({
    mutationFn: (delId) => OccupationalService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["occupationals"] });
      onToast?.("Occupational deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to delete occupational", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to delete occupational", "error");
      }
    },
  });

  return {
    occupationalsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    occupationalQuery,
    createOccupational,
    updateOccupational,
    deleteOccupational,
  };
}
