import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { AdminLayout } from "@Layouts/AdminLayout";
import { useUnitCodeManager } from "modules/admin/frameworks/hooks/tpqi/useUnitCodeHooks";
import { UnitCode, CreateUnitCodeDto, UpdateUnitCodeDto } from "modules/admin/frameworks/types/tpqi/unitCodeTypes";
import { AddEditUnitCodeModal, DeleteUnitCodeModal } from "./UnitCodeModals";

export default function UnitCodePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<UnitCode | null>(null);
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

  const { fetchPage, unitCodesQuery, createUnitCode, updateUnitCode, deleteUnitCode } = useUnitCodeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal controls
  const openAddModal = () => {
    setSelected(null);
    setModalType("add");
  };
  const openEditModal = (u: UnitCode) => {
    setSelected(u);
    setModalType("edit");
  };
  const openDeleteModal = (u: UnitCode) => {
    setSelected(u);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // confirms
  const confirmAdd = (payload: CreateUnitCodeDto) => {
    createUnitCode.mutate(payload, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        unitCodesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (payload: UpdateUnitCodeDto) => {
    if (!selected) return;
    updateUnitCode.mutate(
      { id: selected.id, data: payload },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          unitCodesQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selected) return;
    deleteUnitCode.mutate(selected.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        unitCodesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  // table columns
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      { accessorKey: "description", header: "Description" },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: UnitCode } }) => (
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
      <div className="z-10 flex flex-col mb-3 sm:flex-row sm:justify-between sm:items-start">
        <h1 className="mb-2 text-3xl font-Poppins sm:mb-0">Unit Codes</h1>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAddModal} className="flex items-center">
            <FiPlus className="mr-2" /> Add Unit Code
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search by code, name, or description..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<UnitCode>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditUnitCodeModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCode={selected?.code ?? ""}
        initialName={selected?.name ?? ""}
        initialDescription={selected?.description ?? ""}
        onClose={closeModal}
        onConfirm={(payload) => (modalType === "add" ? confirmAdd(payload as CreateUnitCodeDto) : confirmEdit(payload))}
        isLoading={createUnitCode.status === "pending" || updateUnitCode.status === "pending"}
      />

      <DeleteUnitCodeModal
        isOpen={modalType === "delete"}
        unitCodeText={selected ? `${selected.code}${selected.name ? ` - ${selected.name}` : ""}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteUnitCode.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
