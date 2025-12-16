import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { OperationsService } from "modules/admin/rbac/services/rbac/operationsService";
import { Operation, OperationPageResult } from "modules/admin/rbac/types/operationTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useOperationManager(options?: { id?: number | null; page?: number; perPage?: number; initialPrefetchPages?: number }, onToast?: ToastCallback) {
  const { id = null, page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Operation[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result: OperationPageResult = await OperationsService.getAllOperations(pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["operations", i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  const currentPageQuery = useQuery<OperationPageResult, Error>({
    queryKey: ["operations", page, perPage] as const,
    queryFn: () => OperationsService.getAllOperations(page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  const mergedData: OperationPageResult | undefined = page <= initialPrefetchPages ? prefetchQueries[page - 1]?.data : currentPageQuery.data;

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);
  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);
  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  const operationQuery = useQuery<Operation, Error>({
    queryKey: ["operation", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Operation id is null");
      return OperationsService.getOperationById(id);
    },
    enabled: id !== null,
  });

  const createOperation = useMutation<Operation, Error, Operation>({
    mutationFn: (payload: Operation) => OperationsService.createOperation(payload),
    onSuccess: (created: Operation) => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      queryClient.invalidateQueries({ queryKey: ["operation", created.id] });
      onToast?.("Operation created successfully", "success");
    },
    onError: () => onToast?.("Failed to create operation", "error"),
  });

  const updateOperation = useMutation<Operation, Error, { id: number; data: Partial<Operation> }>({
    mutationFn: ({ id, data }: { id: number; data: Partial<Operation> }) => OperationsService.updateOperation(id, data),
    onSuccess: (updated: Operation) => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      queryClient.invalidateQueries({ queryKey: ["operation", updated.id] });
      onToast?.("Operation updated successfully", "success");
    },
    onError: () => onToast?.("Failed to update operation", "error"),
  });

  const deleteOperation = useMutation<void, Error, number>({
    mutationFn: (opId: number) => OperationsService.deleteOperation(opId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      onToast?.("Operation deleted successfully", "success");
    },
    onError: () => onToast?.("Failed to delete operation", "error"),
  });

  return {
    operationsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    operationQuery,
    createOperation,
    updateOperation,
    deleteOperation,
  };
}
