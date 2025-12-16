import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useKnowledgeManager } from "modules/admin/frameworks/hooks/tpqi/useKnowledgeHooks";
import { Knowledge, CreateKnowledgeDto, UpdateKnowledgeDto } from "modules/admin/frameworks/types/tpqi/knowledgeTypes";
import { AddEditKnowledgeModal, DeleteKnowledgeModal } from "./KnowledgeModals";

export default function KnowledgePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedKnowledge, setSelectedKnowledge] = useState<Knowledge | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset page when search changes
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, knowledgesQuery, createKnowledge, updateKnowledge, deleteKnowledge } = useKnowledgeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modals
  const openAddModal = () => {
    setSelectedKnowledge(null);
    setModalType("add");
  };
  const openEditModal = (k: Knowledge) => {
    setSelectedKnowledge(k);
    setModalType("edit");
  };
  const openDeleteModal = (k: Knowledge) => {
    setSelectedKnowledge(k);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedKnowledge(null);
  };

  // confirms
  const confirmAdd = (name: string, categoryId: number | null) => {
    const dto: CreateKnowledgeDto = { name: name || null, categoryId: categoryId ?? null } as any;
    createKnowledge.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        knowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (name: string, categoryId: number | null) => {
    if (!selectedKnowledge) return;
    const dto: UpdateKnowledgeDto = { name: name || null, categoryId: categoryId ?? null } as any;
    updateKnowledge.mutate(
      { id: selectedKnowledge.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          knowledgesQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedKnowledge) return;
    deleteKnowledge.mutate(selectedKnowledge.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        knowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "name", header: "Knowledge name" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: Knowledge } }) => (
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
        <h1 className="text-3xl font-Poppins mb-2 sm:mb-0">Knowledges</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Knowledge
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search knowledges..." className="pl-3 pr-30 py-1 text-sm" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      <DataTable<Knowledge>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditKnowledgeModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialText={selectedKnowledge?.name || ""}
        initialCategoryId={(selectedKnowledge as any)?.categoryId ?? null}
        onClose={closeModal}
        onConfirm={(name, catId) => (modalType === "add" ? confirmAdd(name, catId) : confirmEdit(name, catId))}
        isLoading={createKnowledge.status === "pending" || updateKnowledge.status === "pending"}
      />

      <DeleteKnowledgeModal
        isOpen={modalType === "delete"}
        knowledgeText={selectedKnowledge?.name ?? undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteKnowledge.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
