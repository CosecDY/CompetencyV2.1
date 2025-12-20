import { useState, useMemo, useEffect, useCallback } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useSkillManager } from "modules/admin/frameworks/hooks/sfia/useSkillHooks";
import { Skill, CreateSkillDto, UpdateSkillDto, SubSkill, LevelRef } from "modules/admin/frameworks/types/sfia/skillTypes";
import { AddEditSkillModal, DeleteSkillModal } from "./SkillModals";

// ---- Local helper type: what actually comes back for each table row ----
type SkillRow = Skill & { id: number; subSkills?: SubSkill[]; levels?: LevelRef[] };

export default function SkillPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillRow | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [isLoading, setIsLoading] = useState(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset to first page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, createSkill, updateSkill, deleteSkill } = useSkillManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const handleAddSkill = useCallback(() => {
    setSelectedSkill(null);
    setModalMode("add");
    setIsAddEditModalOpen(true);
  }, []);

  const handleEditSkill = useCallback((skill: SkillRow) => {
    setSelectedSkill(skill);
    setModalMode("edit");
    setIsAddEditModalOpen(true);
  }, []);

  const handleDeleteSkill = useCallback((skill: SkillRow) => {
    setSelectedSkill(skill);
    setIsDeleteModalOpen(true);
  }, []);

  // We treat the modal field as "levelId" (numeric)
  const handleConfirmAddEdit = async (levelId: number | null) => {
    if (levelId == null) {
      handleToast("Please enter a valid level ID", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (modalMode === "edit" && selectedSkill) {
        await updateSkill.mutateAsync({
          id: selectedSkill.id,
          data: { levelId } as UpdateSkillDto,
        });
        handleToast("Skill updated successfully", "success");
      } else {
        await createSkill.mutateAsync({ levelId } as unknown as CreateSkillDto);
        handleToast("Skill created successfully", "success");
      }
      setIsAddEditModalOpen(false);
    } catch (error) {
      handleToast("Failed to save skill", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSkill) return;

    setIsLoading(true);
    try {
      await deleteSkill.mutateAsync(selectedSkill.id);
      handleToast("Skill deleted successfully", "success");
      setIsDeleteModalOpen(false);
    } catch (error) {
      handleToast("Failed to delete skill", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }: { row: { original: SkillRow } }) => <span className="font-mono text-sm font-semibold">{row.original.code}</span>,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }: { row: { original: SkillRow } }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        accessorKey: "categoryId",
        header: "Category ID",
        cell: ({ row }: { row: { original: SkillRow } }) => <span className="text-sm text-gray-600">{row.original.categoryId}</span>,
      },
      {
        accessorKey: "levelId",
        header: "Level ID",
        cell: ({ row }: { row: { original: SkillRow } }) => <span className="text-sm text-gray-600">{row.original.levelId}</span>,
      },
      {
        accessorKey: "overview",
        header: "Overview",
        cell: ({ row }: { row: { original: SkillRow } }) => <span className="block max-w-xs text-sm text-gray-700 truncate">{row.original.overview}</span>,
      },
      {
        accessorKey: "subSkills",
        header: "Sub Skills",
        cell: ({ row }: { row: { original: SkillRow } }) => {
          const count = row.original.subSkills?.length || 0;
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{count} skills</span>;
        },
      },
      {
        accessorKey: "levels",
        header: "Levels",
        cell: ({ row }: { row: { original: SkillRow } }) => {
          const count = row.original.levels?.length || 0;
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{count} levels</span>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: { row: { original: SkillRow } }) => <RowActions onEdit={() => handleEditSkill(row.original)} onDelete={() => handleDeleteSkill(row.original)} />,
      },
    ],
    [handleEditSkill, handleDeleteSkill]
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Skills Management</h1>
            <p className="mt-1 text-sm text-gray-600">Manage SFIA skills, their categories, levels, and sub-skills</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex gap-2">
              <Button onClick={handleAddSkill}>
                <div className="flex items-center">
                  <FiPlus className="w-4 h-4" />
                  Add Skill
                </div>
              </Button>
            </div>

            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by skill name or code..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <DataTable<SkillRow>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      {/* Modals */}
      <AddEditSkillModal
        isOpen={isAddEditModalOpen}
        mode={modalMode}
        initialCode={selectedSkill?.levelId ?? null} // we treat as levelId input
        onClose={() => setIsAddEditModalOpen(false)}
        onConfirm={handleConfirmAddEdit}
        isLoading={isLoading}
      />

      <DeleteSkillModal
        isOpen={isDeleteModalOpen}
        label={selectedSkill ? `${selectedSkill.code} - ${selectedSkill.name}` : undefined}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        isLoading={isLoading}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
