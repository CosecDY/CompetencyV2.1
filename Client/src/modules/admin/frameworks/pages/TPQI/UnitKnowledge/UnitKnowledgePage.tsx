import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useUnitKnowledgeManager } from "modules/admin/frameworks/hooks/tpqi/useUnitKnowledgeHooks";
import { UnitKnowledgeView, CreateUnitKnowledgeDto, UpdateUnitKnowledgeDto } from "modules/admin/frameworks/types/tpqi/unitKnowledgeTypes";
import { AddEditUnitKnowledgeModal, DeleteUnitKnowledgeModal } from "./UnitKnowledgeModals";

export default function UnitKnowledgePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRow, setSelectedRow] = useState<UnitKnowledgeView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, unitKnowledgesQuery, createUnitKnowledge, updateUnitKnowledge, deleteUnitKnowledge } = useUnitKnowledgeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openAdd = () => {
    setSelectedRow(null);
    setModalType("add");
  };
  const openEdit = (row: UnitKnowledgeView) => {
    setSelectedRow(row);
    setModalType("edit");
  };
  const openDelete = (row: UnitKnowledgeView) => {
    setSelectedRow(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
  };

  const confirmAdd = (unitCodeId: number | null, knowledgeId: number | null) => {
    const dto: CreateUnitKnowledgeDto = {
      unitCodeId: unitCodeId!,
      knowledgeId: knowledgeId!,
    };

    createUnitKnowledge.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        unitKnowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to create: ${err?.message || ""}`, "error"),
    });
  };

  const confirmEdit = (unitCodeId: number | null, knowledgeId: number | null) => {
    if (!selectedRow) return;
    const dto: UpdateUnitKnowledgeDto = {
      unitCodeId: unitCodeId!,
      knowledgeId: knowledgeId!,
    };

    updateUnitKnowledge.mutate(
      { id: selectedRow.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          unitKnowledgesQuery.refetch();
        },
        onError: (err: any) => handleToast(`Failed to update: ${err?.message || ""}`, "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRow) return;

    deleteUnitKnowledge.mutate(selectedRow.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        unitKnowledgesQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to delete: ${err?.message || ""}`, "error"),
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: UnitKnowledgeView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "unitCode.code",
        header: "Unit Code",
        cell: ({ row }: { row: { original: UnitKnowledgeView } }) => row.original.UnitCode?.code ?? "—",
      },
      {
        accessorKey: "unitCode.name",
        header: "Unit Name",
        cell: ({ row }: { row: { original: UnitKnowledgeView } }) => row.original.UnitCode?.name ?? "—",
      },
      {
        accessorKey: "knowledge.name",
        header: "Knowledge",
        cell: ({ row }: { row: { original: UnitKnowledgeView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.Knowledge?.name || "—"}>
              {row.original.Knowledge?.name ?? "—"}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => (
          <span className="flex justify-end">
            <FiSettings className="w-4 h-4" />
          </span>
        ),
        cell: ({ row }: { row: { original: UnitKnowledgeView } }) => (
          <div className="flex justify-end">
            <RowActions onEdit={() => openEdit(row.original)} onDelete={() => openDelete(row.original)} />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Unit & Knowledge</h1>
            <p className="mt-1 text-sm text-gray-600">Map unit codes to knowledge items</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Button
              size="md"
              onClick={() => {
                setSelectedRow(null);
                setModalType("add");
              }}
            >
              <div className="flex items-center">
                <FiPlus className="w-4 h-4 mr-2" />
                Add Unit–Knowledge
              </div>
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by unit code/name or knowledge..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <DataTable<UnitKnowledgeView>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20, 50]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditUnitKnowledgeModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialUnitCode={selectedRow?.unitCodeId ?? null}
        initialKnowledgeId={selectedRow?.knowledgeId ?? null}
        onClose={closeModal}
        onConfirm={(unitCode, knowledgeId) => (modalType === "add" ? confirmAdd(unitCode, knowledgeId) : confirmEdit(unitCode, knowledgeId))}
        isLoading={createUnitKnowledge.status === "pending" || updateUnitKnowledge.status === "pending"}
      />

      <DeleteUnitKnowledgeModal
        isOpen={modalType === "delete"}
        label={selectedRow ? `${selectedRow.UnitCode?.code ?? ""} ${selectedRow.UnitCode?.name ?? ""} ↔ ${selectedRow.Knowledge?.name ?? "Unknown"}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteUnitKnowledge.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
