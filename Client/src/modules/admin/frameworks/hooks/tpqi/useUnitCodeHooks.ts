import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UnitCodeService } from "modules/admin/frameworks/services/tpqi/unitcodeServices";
import { UnitCode, CreateUnitCodeDto, UpdateUnitCodeDto, UnitCodePageResult } from "modules/admin/frameworks/types/tpqi/unitCodeTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUnitCodeManager(
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

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: UnitCode[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UnitCodeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["UnitCode", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<UnitCodePageResult, Error>({
    queryKey: ["UnitCode", search, page, perPage],
    queryFn: () => UnitCodeService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previous) => previous,
  });

  const mergedData: UnitCodePageResult | undefined = (() => {
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

  const unitCodeQuery = useQuery<UnitCode | undefined, Error>({
    queryKey: ["UnitCode", id],
    queryFn: () => {
      if (id === null) return Promise.resolve(undefined);
      return UnitCodeService.getById(id);
    },
    enabled: id !== null,
  });

  const createUnitCode = useMutation<UnitCode, Error, CreateUnitCodeDto>({
    mutationFn: (data) => UnitCodeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UnitCode"] });
      onToast?.("Unit Code created successfully", "success");
    },
    onError: (error) => {
      onToast?.(`Error creating Unit Code: ${error.message}`, "error");
    },
  });

  const updateUnitCode = useMutation<UnitCode, Error, { id: number; data: UpdateUnitCodeDto }>({
    mutationFn: ({ id, data }) => UnitCodeService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["UnitCode"] });
      queryClient.invalidateQueries({ queryKey: ["UnitCode", updated.id] });
      onToast?.("Unit Code updated successfully", "success");
    },
    onError: (error) => {
      onToast?.(`Error updating Unit Code: ${error.message}`, "error");
    },
  });

  const deleteUnitCode = useMutation<void, Error, number>({
    mutationFn: (delId) => UnitCodeService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UnitCode"] });
      onToast?.("Unit Code deleted successfully", "success");
    },
    onError: (error) => {
      onToast?.(`Error deleting Unit Code: ${error.message}`, "error");
    },
  });

  return {
    unitCodesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    unitCodeQuery,
    createUnitCode,
    updateUnitCode,
    deleteUnitCode,
    fetchPage,
  };
}
