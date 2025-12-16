import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { SkillService } from "modules/admin/frameworks/services/sfia/skillServices";
import { Skill, CreateSkillDto, UpdateSkillDto, SkillPageResult } from "modules/admin/frameworks/types/sfia/skillTypes";

type ToastCallback = (message: string, type?: "success" | "error" | "info") => void;

export function useSkillManager(
  options?: {
    id?: number | null;
    skillId?: number | null;
    levelId?: number | null;
    search?: string;
    page?: number;
    perPage?: number;
    initialPrefetchPages?: number;
  },
  onToast?: ToastCallback
) {
  const { id = null, search = "", page = 1, perPage = 10, initialPrefetchPages = 3 } = options || {};
  const queryClient = useQueryClient();

  // ฟังก์ชัน fetchPage ใช้ดึงข้อมูลแต่ละหน้า
  const fetchPage = async (pageIndex: number, pageSize: number): Promise<{ data: Skill[]; total: number }> => {
    const pageNumber = pageIndex + 1;
    const result = await SkillService.getAll(search, pageNumber, pageSize);
    return {
      data: result.data ?? [],
      total: result.total ?? 0,
    };
  };

  // prefetch หลายหน้าแรก
  const prefetchQueries = useQueries({
    queries: Array.from({ length: initialPrefetchPages }, (_, i) => ({
      queryKey: ["skills", search, i + 1, perPage] as const,
      queryFn: () => fetchPage(i, perPage),
      staleTime: 5 * 60 * 1000,
      enabled: true,
    })),
  });

  // โหลดหน้าปัจจุบัน ถ้าเกิน prefetch
  const currentPageQuery = useQuery<SkillPageResult, Error>({
    queryKey: ["skills", search, page, perPage] as const,
    queryFn: () => SkillService.getAll(search, page, perPage),
    enabled: page > initialPrefetchPages,
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
  });

  // รวมข้อมูลจาก prefetch กับหน้าปัจจุบัน
  const mergedData: SkillPageResult | undefined = (() => {
    if (page <= initialPrefetchPages) {
      const pre = prefetchQueries[page - 1];
      if (pre && !pre.isLoading && !pre.isError) return pre.data;
      return undefined;
    }
    return currentPageQuery.data;
  })();

  const isLoading = prefetchQueries.some((q) => q.isLoading) || (page > initialPrefetchPages && currentPageQuery.isLoading);

  const isError = prefetchQueries.some((q) => q.isError) || (page > initialPrefetchPages && currentPageQuery.isError);

  const error = prefetchQueries.find((q) => q.error)?.error || (page > initialPrefetchPages && currentPageQuery.error);

  // ดึงข้อมูลเฉพาะตัวเดียว (useQuery)
  const skillQuery = useQuery<Skill, Error>({
    queryKey: ["skill", id] as const,
    queryFn: async () => {
      if (id === null) throw new Error("Skill id is null");
      return SkillService.getById(id);
    },
    enabled: id !== null,
  });

  // Mutation: create
  const createSkill = useMutation<Skill, Error, CreateSkillDto>({
    mutationFn: (dto) => SkillService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      onToast?.("Skill created successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to create skill", "error");
    },
  });

  // Mutation: update
  const updateSkill = useMutation<Skill, Error, { id: number; data: UpdateSkillDto }>({
    mutationFn: ({ id, data }) => SkillService.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      queryClient.invalidateQueries({ queryKey: ["skill", updated.code] });
      onToast?.("Skill updated successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to update skill", "error");
    },
  });

  // Mutation: delete
  const deleteSkill = useMutation<void, Error, number>({
    mutationFn: (delId) => SkillService.delete(delId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      onToast?.("Skill deleted successfully", "success");
    },
    onError: () => {
      onToast?.("Failed to delete skill", "error");
    },
  });

  return {
    skillsQuery: {
      data: mergedData,
      isLoading,
      isError,
      error,
      refetch: currentPageQuery.refetch,
    },
    fetchPage,
    skillQuery,
    createSkill,
    updateSkill,
    deleteSkill,
  };
}
