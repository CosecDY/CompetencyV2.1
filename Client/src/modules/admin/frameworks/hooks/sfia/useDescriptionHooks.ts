import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { DescriptionService } from "modules/admin/frameworks/services/sfia/descriptionServices";
import { Description, CreateDescriptionDto, UpdateDescriptionDto, DescriptionPageResult } from "modules/admin/frameworks/types/sfia/descriptionTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useDescriptionManager(
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

  // fetchPage: load a single page
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Description[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await DescriptionService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // pre-fetch first N pages
  const prefetch = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["descriptions", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60_000,
      enabled: true,
    })),
  });

  // current page query (if beyond prefetch)
  const pageQuery = useQuery<DescriptionPageResult, Error>({
    queryKey: ["descriptions", search, page, perPage] as const,
    queryFn: () => DescriptionService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60_000,
    placeholderData: (prev) => prev,
  });

  // merge prefetch & current
  const merged: DescriptionPageResult | undefined = page <= initialPrefetchPages ? prefetch[page - 1]?.data : pageQuery.data;

  const isLoading = prefetch.some((q) => q.isLoading) || (page > initialPrefetchPages && pageQuery.isLoading);

  const isError = prefetch.some((q) => q.isError) || (page > initialPrefetchPages && pageQuery.isError);

  const error = prefetch.find((q) => q.error)?.error || (page > initialPrefetchPages && pageQuery.error);

  // single-item query
  const descQuery = useQuery<Description, Error>({
    queryKey: ["description", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Description id is null");
      return DescriptionService.getById(id);
    },
    enabled: id !== null,
  });

  // create
  const create = useMutation<Description, Error, CreateDescriptionDto>({
    mutationFn: (dto) => DescriptionService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      onToast?.("Description created", "success");
    },
    onError: () => {
      onToast?.("Failed to create description", "error");
    },
  });

  // update
  const update = useMutation<Description, Error, { id: number; data: UpdateDescriptionDto }>({
    mutationFn: ({ id, data }) => DescriptionService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      queryClient.invalidateQueries({ queryKey: ["description", updated.id] });
      onToast?.("Description updated", "success");
    },
    onError: () => {
      onToast?.("Failed to update description", "error");
    },
  });

  // delete
  const remove = useMutation<void, Error, number>({
    mutationFn: (delId) => DescriptionService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["descriptions"] });
      onToast?.("Description deleted", "success");
    },
    onError: () => {
      onToast?.("Failed to delete description", "error");
    },
  });

  return {
    descriptionsQuery: {
      data: merged,
      isLoading,
      isError,
      error,
      refetch: pageQuery.refetch,
    },
    fetchPage,
    descriptionQuery: descQuery,
    createDescription: create,
    updateDescription: update,
    deleteDescription: remove,
  };
}
