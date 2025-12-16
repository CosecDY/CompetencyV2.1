import { ClUnitCodeService } from "modules/admin/frameworks/services/tpqi/clUnitCodeServices";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClUnitCode, ClUnitCodePageResult, ClUnitCodeView, CreateClUnitCodeDto, UpdateClUnitCodeDto } from "modules/admin/frameworks/types/tpqi/clUnitCodeTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useClUnitCodeManager(
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
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: ClUnitCodeView[] | any[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await ClUnitCodeService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["clUnitCode", "list", search, i + 1, perPage],
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const mergeData = (prefetchData: { data: ClUnitCodeView[] | any[]; total: number }[], currentData?: ClUnitCodePageResult) => {
    const allData = prefetchData.flatMap((d) => d.data);
    const total = currentData?.total ?? (prefetchData.length > 0 ? prefetchData[0].total : 0);
    return { data: allData, total };
  };

  const currentPageQuery = useQuery<ClUnitCodePageResult, Error>({
    queryKey: ["clUnitCode", "list", search, page, perPage],
    queryFn: async () => {
      const res = await ClUnitCodeService.getAll(search, page, perPage);
      return res;
    },
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const ClUnitCodeQuery = useQuery<ClUnitCode, Error>({
    queryKey: ["clUnitCode", "detail", id],
    queryFn: async () => {
      if (id === null) throw new Error("Invalid ID");
      const res = await ClUnitCodeService.getById(id);
      return ClUnitCodeService.getById(id);
    },
    enabled: id !== null,
  });

  const createClUnitCode = useMutation<ClUnitCode, Error, CreateClUnitCodeDto>({
    mutationFn: (dto) => ClUnitCodeService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clUnitCode", "list"] });
      onToast?.("CL Unit Code created successfully", "success");
    },
    onError: (err: any) => {
      onToast?.("Failed to create CL Unit Code: " + (err?.message || ""), "error");
    },
  });

  const updateClUnitCode = useMutation<ClUnitCode, Error, { id: number; data: UpdateClUnitCodeDto }>({
    mutationFn: ({ id, data }) => ClUnitCodeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clUnitCode", "list"] });
      queryClient.invalidateQueries({ queryKey: ["clUnitCode", "detail", id] });
      onToast?.("CL Unit Code updated successfully", "success");
    },
    onError: (err: any) => {
      onToast?.("Failed to update CL Unit Code: " + (err?.message || ""), "error");
    },
  });

  const deleteClUnitCode = useMutation<void, Error, number>({
    mutationFn: (id) => ClUnitCodeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clUnitCode", "list"] });
      onToast?.("CL Unit Code deleted successfully", "success");
    },
    onError: (err: any) => {
      onToast?.("Failed to delete CL Unit Code: " + (err?.message || ""), "error");
    },
  });

  return {
    clUnitCodesQuery: {
      data: mergeData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    ClUnitCodeQuery,
    createClUnitCode,
    updateClUnitCode,
    deleteClUnitCode,
    fetchPage,
  };
}
