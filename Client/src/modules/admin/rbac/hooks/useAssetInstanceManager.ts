import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetInstancesService } from "modules/admin/rbac/services/rbac/assetInstancesService";
import { AssetInstance, CreateAssetInstanceDto, UpdateAssetInstanceDto, AssetPageResult } from "modules/admin/rbac/types/assetInstanceTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useAssetInstanceManager(options?: { search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // Fetch all instances and handle pagination & search
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: AssetInstance[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result: AssetPageResult = await AssetInstancesService.getAllInstances();
    const filteredData = result.data.filter((i) => i.recordId.includes(search));
    const start = (pageNumber - 1) * pageSize;
    return {
      data: filteredData.slice(start, start + pageSize),
      total: filteredData.length,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["assetInstances", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Current page query
  const currentPageQuery = useQuery<AssetPageResult, Error>({
    queryKey: ["assetInstances", search, page, perPage] as const,
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // Mutations
  const createInstance = useMutation<AssetInstance, Error, CreateAssetInstanceDto>({
    mutationFn: (dto: CreateAssetInstanceDto) => AssetInstancesService.createInstance(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetInstances"] });
      onToast?.("AssetInstance created successfully", "success");
    },
    onError: () => onToast?.("Failed to create AssetInstance", "error"),
  });

  const updateInstance = useMutation<AssetInstance, Error, { id: number; data: UpdateAssetInstanceDto }>({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssetInstanceDto }) => AssetInstancesService.updateInstanceRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetInstances"] });
      onToast?.("AssetInstance updated successfully", "success");
    },
    onError: () => onToast?.("Failed to update AssetInstance", "error"),
  });

  const deleteInstanceById = useMutation<void, Error, number>({
    mutationFn: (id: number) => AssetInstancesService.deleteInstanceById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetInstances"] });
      onToast?.("AssetInstance deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete AssetInstance", "error"),
  });

  const deleteInstance = useMutation<void, Error, { assetId: number; recordId: string }>({
    mutationFn: (payload: { assetId: number; recordId: string }) => AssetInstancesService.deleteInstance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assetInstances"] });
      onToast?.("AssetInstance deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete AssetInstance", "error"),
  });

  return {
    assetInstancesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    createInstance,
    updateInstance,
    deleteInstanceById,
    deleteInstance,
  };
}
