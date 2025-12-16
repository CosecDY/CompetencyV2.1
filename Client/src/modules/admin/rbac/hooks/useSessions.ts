import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { SessionsService } from "modules/admin/rbac/services/rbac/sessionsService";
import { Session, SessionPageResult } from "modules/admin/rbac/types/sessionTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSessionManager(options?: { id?: string | null; search?: string; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // fetch page จาก getAll
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Session[]; total: number }> => {
    const result: SessionPageResult = await SessionsService.getAll(search, pageIndex + 1, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["sessions", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<{ data: Session[]; total: number }, Error>({
    queryKey: ["sessions", search, page, perPage] as const,
    queryFn: () => fetchPage(page - 1, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const sessionQuery = useQuery<Session, Error>({
    queryKey: ["session", id] as const,
    queryFn: async () => {
      if (!id) throw new Error("Session id is null");
      return SessionsService.getSessionById(id);
    },
    enabled: id !== null,
  });

  const createSession = useMutation<Session, Error, Session>({
    mutationFn: (payload: Session) => SessionsService.createSession(payload),
    onSuccess: (created: Session) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", created.id] });
      onToast?.("Session created successfully", "success");
    },
    onError: () => onToast?.("Failed to create session", "error"),
  });

  const deleteSession = useMutation<void, Error, string>({
    mutationFn: (sessionId: string) => SessionsService.deleteSessionById(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session", sessionId] });
      onToast?.("Session deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete session", "error"),
  });

  return {
    sessionsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    sessionQuery,
    createSession,
    deleteSession,
  };
}
