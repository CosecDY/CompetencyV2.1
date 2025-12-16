import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { RolesService } from "modules/admin/rbac/services/rbac/rolesService";
import { Role, RolePageResult, CreateRoleDto, UpdateRoleDto } from "@Types/competency/rbacTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useRoleManager(options?: { id?: number | null; search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Role[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await RolesService.getAllRoles(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["roles", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<RolePageResult, Error>({
    queryKey: ["roles", search, page, perPage] as const,
    queryFn: () => RolesService.getAllRoles(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: RolePageResult | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const roleQuery = useQuery<Role, Error>({
    queryKey: ["role", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Role id is null");
      return RolesService.getRoleById(id);
    },
    enabled: id !== null,
  });

  const createRole = useMutation<Role, Error, CreateRoleDto>({
    mutationFn: (dto: CreateRoleDto) => RolesService.createRole(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });

      onToast?.("Role created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create role", "error");
    },
  });

  const updateRole = useMutation<Role, Error, { id: number; data: UpdateRoleDto }>({
    mutationFn: ({ id, data }: { id: number; data: UpdateRoleDto }) => RolesService.updateRole(id, data),
    onSuccess: (updated: Role) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["role", updated.id] });
      onToast?.("Role updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update role", "error");
    },
  });

  const deleteRole = useMutation<void, Error, number>({
    mutationFn: (delId: number) => RolesService.deleteRole(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      onToast?.("Role deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete role", "error");
    },
  });

  return {
    rolesQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    roleQuery,
    createRole,
    updateRole,
    deleteRole,
  };
}
