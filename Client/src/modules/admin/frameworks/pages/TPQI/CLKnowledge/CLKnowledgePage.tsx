import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useCLKnowledgeManager } from "modules/admin/frameworks/hooks/tpqi/useCLKnowledgeHooks";
import { ClKnowledgeView, CreateClKnowledgeDto, UpdateClKnowledgeDto } from "modules/admin/frameworks/types/tpqi/clKnowledgeTypes";
import { AddEditClKnowledgeModal, DeleteClKnowledgeModal } from "./CLKnowledgeModals";

export default function CareerKnowledgePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<ClKnowledgeView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, clKnowledgesQuery, createClKnowledge, updateClKnowledge, deleteClKnowledge } = useCLKnowledgeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modals
  const openAdd = () => {
    setSelected(null);
    setModalType("add");
  };
  const openEdit = (row: ClKnowledgeView) => {
    setSelected(row);
    setModalType("edit");
  };
  const openDelete = (row: ClKnowledgeView) => {
    setSelected(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // Confirm handlers
  const confirmAdd = (payload: { careerLevelId: number; knowledgeId: number }) => {
    const dto: CreateClKnowledgeDto = {
      careerLevelId: payload.careerLevelId,
      knowledgeId: payload.knowledgeId,
    };

    createClKnowledge.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        clKnowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (payload: { careerLevelId: number; knowledgeId: number }) => {
    if (!selected) return;

    const dto: UpdateClKnowledgeDto = {
      careerLevelId: payload.careerLevelId,
      knowledgeId: payload.knowledgeId,
    };

    updateClKnowledge.mutate(
      { id: selected.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          clKnowledgesQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selected) return;

    deleteClKnowledge.mutate(selected.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        clKnowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        id: "careerName",
        header: "Career Name",
        cell: ({ row }: { row: { original: ClKnowledgeView } }) => row.original?.careerLevel?.career?.name ?? "-",
      },
      {
        accessorKey: "knowledge.name",
        header: "Knowledge Name",
        cell: ({ row }: { row: { original: ClKnowledgeView } }) => row.original?.knowledge?.name ?? "-",
      },
      {
        id: "levelName",
        header: "Level Name",
        cell: ({ row }: { row: { original: ClKnowledgeView } }) => row.original?.careerLevel?.level?.name ?? "-",
      },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: ClKnowledgeView } }) => (
          <div className="text-right">
            <RowActions onEdit={() => openEdit(row.original)} onDelete={() => openDelete(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Career Knowledge</h1>
          <p className="mt-1 text-sm text-gray-600">Map Career to knowledge items</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAdd}>
            <div className="flex items-center">
              <FiPlus className="mr-2" /> Add Knowledge
            </div>
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search by knowledge name..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<ClKnowledgeView>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns as any}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditClKnowledgeModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCareerLevelId={selected?.careerLevelId ?? null}
        initialKnowledgeId={selected?.knowledgeId ?? null}
        onClose={closeModal}
        onConfirm={confirmEdit}
        isLoading={updateClKnowledge.isPending}
      />

      <DeleteClKnowledgeModal
        isOpen={modalType === "delete"}
        label={`${selected?.knowledge?.name ?? "Unknown knowledge"} — ${selected?.careerLevel?.career?.name ?? "Unknown career"} / Level ${selected?.careerLevel?.level?.name ?? "-"}`}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteClKnowledge.isPending}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
