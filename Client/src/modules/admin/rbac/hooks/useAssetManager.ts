import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssetsService } from "modules/admin/rbac/services/rbac/assetsService";
import { Asset, AssetPageResult, CreateAssetDto, UpdateAssetDto } from "modules/admin/rbac/types/assetTypes";
import { RolePermission } from "modules/admin/rbac/types/rbac/rolePermissionTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useAssetManager(options?: { id?: number | null; search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // Fetch a page of assets
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Asset[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await AssetsService.getAllAssets(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["assets", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Current page query
  const currentPageQuery = useQuery<AssetPageResult, Error>({
    queryKey: ["assets", search, page, perPage] as const,
    queryFn: () => AssetsService.getAllAssets(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: AssetPageResult | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // Single asset query
  const assetQuery = useQuery<Asset, Error>({
    queryKey: ["asset", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Asset id is null");
      return AssetsService.getAssetById(id);
    },
    enabled: id !== null,
  });

  // Role permissions for asset
  const rolePermissionsQuery = useQuery<RolePermission[], Error>({
    queryKey: ["assetRolePermissions", id] as const,
    queryFn: async () => {
      if (id === null) return [];
      return AssetsService.getRolePermissionsForAsset(id);
    },
    enabled: id !== null,
  });

  // Mutations
  const createAsset = useMutation<Asset, Error, CreateAssetDto>({
    mutationFn: (dto: CreateAssetDto) => AssetsService.createAsset(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      onToast?.("Asset created successfully", "success");
    },
    onError: () => onToast?.("Failed to create asset", "error"),
  });

  const updateAsset = useMutation<Asset, Error, { id: number; data: UpdateAssetDto }>({
    mutationFn: ({ id, data }: { id: number; data: UpdateAssetDto }) => AssetsService.updateAsset(id, data),
    onSuccess: (updated: Asset) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset", updated.id] });
      onToast?.("Asset updated successfully", "success");
    },
    onError: () => onToast?.("Failed to update asset", "error"),
  });

  const deleteAsset = useMutation<void, Error, number>({
    mutationFn: (delId: number) => AssetsService.deleteAsset(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      onToast?.("Asset deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete asset", "error"),
  });

  return {
    assetsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    assetQuery,
    rolePermissionsQuery,
    createAsset,
    updateAsset,
    deleteAsset,
  };
}
