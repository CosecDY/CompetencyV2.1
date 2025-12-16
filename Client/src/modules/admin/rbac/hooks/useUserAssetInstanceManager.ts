import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserAssetInstanceService } from "modules/admin/rbac/services/rbac/userAssetInstanceService";
import { UserAssetInstance, UserAssetInstanceListResponse, UserAssetInstanceAssignmentDto } from "modules/admin/rbac/types/userAssetInstanceTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUserAssetInstanceManager(options?: { search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<UserAssetInstanceListResponse> => {
    const pageNumber = pageIndex + 1;
    return UserAssetInstanceService.getAllUserAssetInstances({ search, page: pageNumber, perPage: pageSize });
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["userAssetInstances", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<UserAssetInstanceListResponse, Error>({
    queryKey: ["userAssetInstances", search, page, perPage] as const,
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: UserAssetInstanceListResponse | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const assignAssetInstancesToUser = useMutation<UserAssetInstance[], Error, UserAssetInstanceAssignmentDto>({
    mutationFn: (payload: UserAssetInstanceAssignmentDto) => UserAssetInstanceService.assignAssetInstancesToUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAssetInstances"] });
      onToast?.("Asset Instances assigned successfully", "success");
    },
    onError: () => onToast?.("Failed to assign Asset Instances", "error"),
  });

  const revokeAssetInstanceFromUser = useMutation<UserAssetInstance, Error, { userId: string; assetInstanceId: number }>({
    mutationFn: ({ userId, assetInstanceId }: { userId: string; assetInstanceId: number }) => UserAssetInstanceService.revokeAssetInstanceFromUser(userId, assetInstanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userAssetInstances"] });
      onToast?.("Asset Instance revoked successfully", "success");
    },
    onError: () => onToast?.("Failed to revoke Asset Instance", "error"),
  });

  return {
    userAssetInstancesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    assignAssetInstancesToUser,
    revokeAssetInstanceFromUser,
  };
}
