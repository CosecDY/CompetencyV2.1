import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionsService } from "modules/admin/rbac/services/rbac/permissionsService";
import { Permission, PermissionPageResult, CreatePermissionDto, UpdatePermissionDto } from "modules/admin/rbac/types/permissionTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function usePermissionManager(options?: { id?: number | null; search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();
  const normalizedSearch = search ?? "";

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<PermissionPageResult> => {
    const pageNumber = pageIndex + 1;
    const result = await PermissionsService.getAllPermissions(normalizedSearch, pageNumber, pageSize);
    return { data: result.data ?? [], total: result.total ?? 0 };
  };

  // Current page query
  const currentPageQuery = useQuery<PermissionPageResult>({
    queryKey: ["permissions", normalizedSearch, page, perPage],
    queryFn: () => fetchPage(page - 1, perPage),
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch next pages sequentially after current page loads
  useEffect(() => {
    if (!currentPageQuery.data) return;
    const totalPages = Math.max(Math.ceil(currentPageQuery.data.total / perPage), 1);
    for (let i = 1; i <= initialPrefetchPages; i++) {
      const nextPage = page + i;
      if (nextPage > totalPages) break;

      queryClient.prefetchQuery({
        queryKey: ["permissions", normalizedSearch, nextPage, perPage],
        queryFn: () => fetchPage(nextPage - 1, perPage),
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [currentPageQuery.data, page, perPage, initialPrefetchPages, normalizedSearch, queryClient]);
  const mergedData: PermissionPageResult = currentPageQuery.data ?? { data: [], total: 0 };

  const isLoading = currentPageQuery.isLoading;
  const isError = currentPageQuery.isError;
  const error = currentPageQuery.error;

  // Fetch single permission by id
  const permissionQuery = useQuery<Permission, Error>({
    queryKey: ["permission", id],
    queryFn: async () => {
      if (id === null) throw new Error("Permission id is null");
      return PermissionsService.getPermissionById(id);
    },
    enabled: id !== null,
  });

  // Create permission
  const createPermission = useMutation<Permission, Error, CreatePermissionDto>({
    mutationFn: (payload: CreatePermissionDto) => PermissionsService.createPermission(payload),
    onSuccess: (created: Permission) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permission", created.id] });
      onToast?.("Permission created successfully", "success");
    },
    onError: () => onToast?.("Failed to create permission", "error"),
  });

  // Update permission
  const updatePermission = useMutation<Permission, Error, { id: number; data: UpdatePermissionDto }>({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionDto }) => PermissionsService.updatePermission(id, data),
    onSuccess: (updated: Permission) => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      queryClient.invalidateQueries({ queryKey: ["permission", updated.id] });
      onToast?.("Permission updated successfully", "success");
    },
    onError: () => onToast?.("Failed to update permission", "error"),
  });

  // Delete permission
  const deletePermission = useMutation<void, Error, number>({
    mutationFn: (delId: number) => PermissionsService.deletePermission(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      onToast?.("Permission deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete permission", "error"),
  });

  return {
    permissionsQuery: { data: mergedData, isLoading, isError, error, refetch: currentPageQuery.refetch },
    fetchPage,
    permissionQuery,
    createPermission,
    updatePermission,
    deletePermission,
  };
}
