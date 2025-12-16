import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRoleService } from "modules/admin/rbac/services/rbac/userRoleService";
import { UserRole, UserRoleListResponse, UserRoleAssignmentDto } from "modules/admin/rbac/types/userRoleTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUserRoleManager(options?: { search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // Fetch a page of UserRoles
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<UserRoleListResponse> => {
    const pageNumber = pageIndex + 1;
    return UserRoleService.getAllUserRoles({ search, page: pageNumber, perPage: pageSize });
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["userRoles", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Current page query
  const currentPageQuery = useQuery<UserRoleListResponse, Error>({
    queryKey: ["userRoles", search, page, perPage] as const,
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: UserRoleListResponse | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // Assign multiple roles to a user
  const assignRolesToUser = useMutation<UserRole[], Error, UserRoleAssignmentDto>({
    mutationFn: (payload: UserRoleAssignmentDto) => UserRoleService.assignRolesToUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles"] });
      onToast?.("Roles assigned successfully", "success");
    },
    onError: () => onToast?.("Failed to assign roles", "error"),
  });

  // Revoke a single role from a user
  const revokeRoleFromUser = useMutation<UserRole, Error, { userId: string; roleId: number }>({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) => UserRoleService.revokeRoleFromUser(userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRoles"] });
      onToast?.("Role revoked successfully", "success");
    },
    onError: () => onToast?.("Failed to revoke role", "error"),
  });

  return {
    userRolesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    assignRolesToUser,
    revokeRoleFromUser,
  };
}
