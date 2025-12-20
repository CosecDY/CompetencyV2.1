import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";

import { useUnitOccupationalManager } from "modules/admin/frameworks/hooks/tpqi/useUnitOccupationalHooks";
import { UnitOccupationalView, CreateucOccupationalDto, UpdateucOccupationalDto } from "modules/admin/frameworks/types/tpqi/unitOccupationalTypes";
import { AddEditUnitOccupationalModal, DeleteUnitOccupationalModal } from "./UnitOccupationalModals";

export default function UnitOccupationalPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRow, setSelectedRow] = useState<UnitOccupationalView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset page on search change
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, unitOccupationalsQuery, createUnitOccupational, updateUnitOccupational, deleteUnitOccupational } = useUnitOccupationalManager(
    { search: debouncedSearchText, page, perPage },
    handleToast
  );

  // modal controls
  const openAdd = () => {
    setSelectedRow(null);
    setModalType("add");
  };
  const openEdit = (row: UnitOccupationalView) => {
    setSelectedRow(row);
    setModalType("edit");
  };
  const openDelete = (row: UnitOccupationalView) => {
    setSelectedRow(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
  };

  // confirms
  const confirmAdd = (unitCodeId: number | null, occupationalId: number | null) => {
    const dto: CreateucOccupationalDto = {
      unitCodeId: unitCodeId!,
      occupationalId: occupationalId!,
    };

    createUnitOccupational.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        unitOccupationalsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to create: ${err?.message || ""}`, "error"),
    });
  };

  const confirmEdit = (unitCode: number | null, occupationalId: number | null) => {
    if (!selectedRow) return;
    const dto: UpdateucOccupationalDto = {
      unitCodeId: unitCode!,
      occupationalId: occupationalId!,
    };

    updateUnitOccupational.mutate(
      { id: selectedRow.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          unitOccupationalsQuery.refetch();
        },
        onError: (err: any) => handleToast(`Failed to update: ${err?.message || ""}`, "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRow) return;

    deleteUnitOccupational.mutate(selectedRow.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        unitOccupationalsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to delete: ${err?.message || ""}`, "error"),
    });
  };

  // columns — use your exact nested keys: unitcode (lowercase), occupational
  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: UnitOccupationalView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "unitCode.code",
        header: "Unit Code",
        cell: ({ row }: { row: { original: UnitOccupationalView } }) => row.original.unitCode?.code ?? "—",
      },
      {
        accessorKey: "unitCode.name",
        header: "Unit Name",
        cell: ({ row }: { row: { original: UnitOccupationalView } }) => row.original.unitCode?.name ?? "—",
      },
      {
        accessorKey: "occupational.name",
        header: "Occupational",
        cell: ({ row }: { row: { original: UnitOccupationalView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.occupational?.name || "—"}>
              {row.original.occupational?.name ?? "—"}
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
        cell: ({ row }: { row: { original: UnitOccupationalView } }) => (
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Unit & Occupational</h1>
            <p className="mt-1 text-sm text-gray-600">Map unit codes to occupational roles</p>
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
                Add Unit–Occupational
              </div>
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by unit code/name or occupational..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <DataTable<UnitOccupationalView>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20, 50]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditUnitOccupationalModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialUnitCode={selectedRow?.unitCodeId ?? null}
        initialOccupationalId={selectedRow?.occupationalId ?? null}
        onClose={closeModal}
        onConfirm={(unitCode, occupationalId) => (modalType === "add" ? confirmAdd(unitCode, occupationalId) : confirmEdit(unitCode, occupationalId))}
        isLoading={createUnitOccupational.status === "pending" || updateUnitOccupational.status === "pending"}
      />

      <DeleteUnitOccupationalModal
        isOpen={modalType === "delete"}
        label={selectedRow ? `${selectedRow.unitCode?.code ?? ""} ${selectedRow.unitCode?.name ?? ""} ↔ ${selectedRow.occupational?.name ?? "Unknown"}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteUnitOccupational.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
