import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";

import { useUnitSectorManager } from "modules/admin/frameworks/hooks/tpqi/useUnitSectorHooks";
import { UnitSectorView, CreateUnitSectorDto, UpdateUnitSectorDto } from "modules/admin/frameworks/types/tpqi/unitSectorTypes";
import { AddEditUnitSectorModal, DeleteUnitSectorModal } from "./UnitSectorModals";

export default function UnitSectorPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRow, setSelectedRow] = useState<UnitSectorView | null>(null);
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

  const { fetchPage, unitSectorsQuery, createUnitSector, updateUnitSector, deleteUnitSector } = useUnitSectorManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal controls
  const openAdd = () => {
    setSelectedRow(null);
    setModalType("add");
  };
  const openEdit = (row: UnitSectorView) => {
    setSelectedRow(row);
    setModalType("edit");
  };
  const openDelete = (row: UnitSectorView) => {
    setSelectedRow(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
  };

  // confirms
  const confirmAdd = (unitCodeId: number | null, sectorId: number | null) => {
    if (unitCodeId == null || sectorId == null) {
      return handleToast("กรุณากรอก Unit Code ID และ Sector ID", "error");
    }
    const dto: CreateUnitSectorDto = { unitCodeId, sectorId } as CreateUnitSectorDto;
    createUnitSector.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        unitSectorsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to create: ${err?.message || ""}`, "error"),
    });
  };

  const confirmEdit = (unitCodeId: number | null, sectorId: number | null) => {
    if (!selectedRow) return;
    const dto: UpdateUnitSectorDto = {};
    if (unitCodeId != null) dto.unitCodeId = unitCodeId;
    if (sectorId != null) dto.sectorId = sectorId;

    updateUnitSector.mutate(
      { id: selectedRow.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          unitSectorsQuery.refetch();
        },
        onError: (err: any) => handleToast(`Failed to update: ${err?.message || ""}`, "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRow) return;
    deleteUnitSector.mutate(selectedRow.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        unitSectorsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to delete: ${err?.message || ""}`, "error"),
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: UnitSectorView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "unitCode.code",
        header: "Unit Code",
        cell: ({ row }: { row: { original: UnitSectorView } }) => row.original.unitCode?.code ?? "—",
      },
      {
        accessorKey: "unitCode.name",
        header: "Unit Name",
        cell: ({ row }: { row: { original: UnitSectorView } }) => row.original.unitCode?.name ?? "—",
      },
      {
        accessorKey: "sector.name",
        header: "Sector name",
        cell: ({ row }: { row: { original: UnitSectorView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.sector?.name || "—"}>
              {row.original.sector?.name ?? "—"}
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
        cell: ({ row }: { row: { original: UnitSectorView } }) => (
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Unit & Sector</h1>
            <p className="mt-1 text-sm text-gray-600">Map unit codes to sectors</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Button size="md" onClick={openAdd}>
              <div className="flex items-center">
                <FiPlus className="w-4 h-4 mr-2" />
                Add Unit–Sector
              </div>
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by unit code/name or sector..."
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
        <DataTable<UnitSectorView>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      <AddEditUnitSectorModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialUnitCode={selectedRow?.unitCodeId ?? null}
        initialSectorId={selectedRow?.sectorId ?? null}
        onClose={closeModal}
        onConfirm={(unitCodeId, sectorId) => (modalType === "add" ? confirmAdd(unitCodeId, sectorId) : confirmEdit(unitCodeId, sectorId))}
        isLoading={createUnitSector.status === "pending" || updateUnitSector.status === "pending"}
      />

      <DeleteUnitSectorModal
        isOpen={modalType === "delete"}
        label={selectedRow ? `${selectedRow.unitCode?.code ?? ""} ${selectedRow.unitCode?.name ?? ""} ↔ ${selectedRow.sector?.name ?? "Unknown"}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteUnitSector.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
