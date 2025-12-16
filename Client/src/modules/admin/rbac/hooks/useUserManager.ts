import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersService } from "modules/admin/rbac/services/rbac/usersService";
import { User } from "modules/admin/rbac/types/userTypes";
import { Role } from "modules/admin/rbac/types/roleTypes";
import { AxiosError } from "axios";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useUserManager(options?: { id?: string | null; search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // Fetch a page of users
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: User[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await UsersService.getAllUsers(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // Prefetch first N pages
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["users", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // Current page query
  const currentPageQuery = useQuery<{ data: User[]; total: number }, Error>({
    queryKey: ["users", search, page, perPage] as const,
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: { data: User[]; total: number } | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // Single user query
  const userQuery = useQuery<User, Error>({
    queryKey: ["user", id] as const,
    queryFn: async () => {
      if (!id) throw new Error("User id is null");
      return UsersService.getUserById(id);
    },
    enabled: id !== null,
  });

  // User roles query
  const userRolesQuery = useQuery<Role[], Error>({
    queryKey: ["userRoles", id] as const,
    queryFn: async () => {
      if (!id) return [];
      return UsersService.getUserRoles(id);
    },
    enabled: id !== null,
  });

  // Mutations
  const createUser = useMutation<User, unknown, User>({
    mutationFn: (payload: User) => UsersService.createUser(payload),
    onSuccess: (created: User) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", created.id] });
      onToast?.("User created successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to create user", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to create user", "error");
      }
    },
  });

  const updateUser = useMutation<User, unknown, { id: string; payload: Partial<User> }>({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<User> }) => UsersService.updateUser(id, payload as User),
    onSuccess: (updated: User) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", updated.id] });
      onToast?.("User updated successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to update this user", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to update user", "error");
      }
    },
  });

  const deleteUser = useMutation<void, unknown, string>({
    mutationFn: (userId: string) => UsersService.deleteUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
      onToast?.("User deleted successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to delete this user", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to delete user", "error");
      }
    },
  });

  const assignRole = useMutation<void, Error, { userId: string; roleId: number }>({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) => UsersService.assignRoleToUser(userId, roleId),
    onSuccess: (_data, variables) => {
      const { userId } = variables;
      queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
      onToast?.("Role assigned successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to assign role", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to assign role", "error");
      }
    },
  });

  const revokeRole = useMutation<void, Error, { userId: string; roleId: number }>({
    mutationFn: ({ userId, roleId }: { userId: string; roleId: number }) => UsersService.revokeRoleFromUser(userId, roleId),
    onSuccess: (_data, variables) => {
      const { userId } = variables;
      queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
      onToast?.("Role revoked successfully", "success");
    },
    onError: (err: unknown) => {
      const error = err as AxiosError;
      if (error.response?.status === 403) {
        onToast?.("Forbidden: You do not have permission to revoke role", "error");
      } else if (error.response?.status === 401) {
        onToast?.("Unauthorized: Please login first", "error");
      } else {
        onToast?.("Failed to revoke role", "error");
      }
    },
  });

  return {
    usersQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    userQuery,
    userRolesQuery,
    createUser,
    updateUser,
    deleteUser,
    assignRole,
    revokeRole,
  };
}
