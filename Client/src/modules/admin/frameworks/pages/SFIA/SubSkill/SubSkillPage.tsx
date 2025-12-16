import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { AddEditSubSkillModal, DeleteSubSkillModal } from "./SubSkillModals";
import { useSubSkillManager } from "modules/admin/frameworks/hooks/sfia/useSubSkillHooks";
import { SubSkill, CreateSubSkillDto, UpdateSubSkillDto } from "modules/admin/frameworks/types/sfia/subSkillTypes";

export default function SubSkillPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<SubSkill | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset to first page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, subSkillsQuery, createSubSkill, updateSubSkill, deleteSubSkill } = useSubSkillManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal helpers
  const openAdd = () => {
    setSelected(null);
    setModalType("add");
  };
  const openEdit = (row: SubSkill) => {
    setSelected(row);
    setModalType("edit");
  };
  const openDelete = (row: SubSkill) => {
    setSelected(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // confirms - Fixed parameter names to match interface
  const confirmAdd = (skillCode: number, descriptionId: number, skillText: string | null) => {
    const dto: CreateSubSkillDto = { skillCode, descriptionId, skillText };
    createSubSkill.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        subSkillsQuery.refetch();
      },
      onError: (err: any) => {
        handleToast("Failed to create: " + (err?.message || ""), "error");
      },
    });
  };

  const confirmEdit = (skillCode: number, descriptionId: number, skillText: string | null) => {
    if (!selected) return;
    const dto: UpdateSubSkillDto = { skillCode, descriptionId, skillText };
    updateSubSkill.mutate(
      { id: selected.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          subSkillsQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selected) return;
    deleteSubSkill.mutate(selected.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        subSkillsQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "skillCode", header: "Skill Code" },
      { accessorKey: "descriptionId", header: "Description ID" },
      { accessorKey: "text", header: "Skill Text" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: SubSkill } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openEdit(row.original)} onDelete={() => openDelete(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  // Fixed delete label to use correct property name
  const deleteLabel = selected ? `${selected.skillCode} / ${selected.descriptionId}${selected.skillText ? `: ${selected.skillText}` : ""}` : undefined;

  return (
    <AdminLayout>
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">SubSkills</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAdd} className="flex items-center">
            <FiPlus className="mr-2" /> Add SubSkill
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search sub-skills..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<SubSkill>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditSubSkillModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialSkillCode={selected?.skillCode || null} // Fixed: now passes number | null
        initialDescriptionId={selected?.descriptionId || null}
        initialSkillText={selected?.skillText || ""} // Fixed: property name
        onClose={closeModal}
        onConfirm={(skillCode, descriptionId, skillText) => (modalType === "add" ? confirmAdd(skillCode, descriptionId, skillText) : confirmEdit(skillCode, descriptionId, skillText))}
        isLoading={createSubSkill.status === "pending" || updateSubSkill.status === "pending"}
      />

      <DeleteSubSkillModal isOpen={modalType === "delete"} subSkillLabel={deleteLabel} onClose={closeModal} onConfirm={confirmDelete} isLoading={deleteSubSkill.status === "pending"} />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
