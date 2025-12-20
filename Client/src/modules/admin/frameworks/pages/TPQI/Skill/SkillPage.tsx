import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useSkillManager } from "modules/admin/frameworks/hooks/tpqi/useSkillHooks";
import { Skill, CreateSkillDto, UpdateSkillDto } from "modules/admin/frameworks/types/tpqi/skillTypes";
import { AddEditSkillModal, DeleteSkillModal } from "./SkillModals";

export default function SkillPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // reset page on search
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  const { fetchPage, skillsQuery, createSkill, updateSkill, deleteSkill } = useSkillManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modal handlers
  const openAddModal = () => {
    setSelectedSkill(null);
    setModalType("add");
  };
  const openEditModal = (sk: Skill) => {
    setSelectedSkill(sk);
    setModalType("edit");
  };
  const openDeleteModal = (sk: Skill) => {
    setSelectedSkill(sk);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedSkill(null);
  };

  // Confirm operations
  const confirmAdd = (text: string) => {
    const dto: CreateSkillDto = { name: text || null };
    createSkill.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        skillsQuery.refetch();
      },
      onError: (error: any) => {
        handleToast("Failed to create: " + (error?.message || ""), "error");
      },
    });
  };

  const confirmEdit = (text: string) => {
    if (!selectedSkill) return;
    const dto: UpdateSkillDto = { name: text || null };
    updateSkill.mutate(
      { id: selectedSkill.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          skillsQuery.refetch();
        },
        onError: (error: any) => {
          handleToast("Failed to update: " + (error?.message || ""), "error");
        },
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedSkill) return;
    deleteSkill.mutate(selectedSkill.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        skillsQuery.refetch();
      },
      onError: (error: any) => {
        handleToast("Failed to delete: " + (error?.message || ""), "error");
      },
    });
  };

  // Table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Skill name" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Skill } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openEditModal(row.original)} onDelete={() => openDeleteModal(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 z-10">
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Skills</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal}>
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Skill
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search skills..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Skill>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditSkillModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedSkill?.name || ""}
        initialCategoryId={selectedSkill?.id ?? null} // keep if your modal expects it; adjust as needed
        onClose={closeModal}
        onConfirm={(text) => (modalType === "add" ? confirmAdd(text) : confirmEdit(text))}
        isLoading={createSkill.status === "pending" || updateSkill.status === "pending"}
      />

      <DeleteSkillModal isOpen={modalType === "delete"} skillText={selectedSkill?.name ?? undefined} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteSkill.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
