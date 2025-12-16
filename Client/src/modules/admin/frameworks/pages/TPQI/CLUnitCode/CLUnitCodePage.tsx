import { useState, useMemo, useEffect } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";

import { useClUnitCodeManager } from "modules/admin/frameworks/hooks/tpqi/useClUnitCodeHooks";
import { ClUnitCodeView, CreateClUnitCodeDto, UpdateClUnitCodeDto } from "modules/admin/frameworks/types/tpqi/clUnitCodeTypes";
import { AddEditCLUnitCodeModal, DeleteCLUnitCodeModal } from "./CLUnitCodeModals";

export default function CLUnitCodePage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRow, setSelectedRow] = useState<ClUnitCodeView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  // reset on search change
  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, clUnitCodesQuery, createClUnitCode, updateClUnitCode, deleteClUnitCode } = useClUnitCodeManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // modal helpers
  const openAdd = () => {
    setSelectedRow(null);
    setModalType("add");
  };
  const openEdit = (row: ClUnitCodeView) => {
    setSelectedRow(row);
    setModalType("edit");
  };
  const openDelete = (row: ClUnitCodeView) => {
    setSelectedRow(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
  };

  // confirms
  const confirmAdd = (careerLevelId: number | null, unitCodeId: number | null) => {
    if (careerLevelId == null || unitCodeId == null) {
      return handleToast("กรุณากรอก CareerLevel ID และ UnitCode ID", "error");
    }
    const dto: CreateClUnitCodeDto = { careerLevelId, unitCodeId } as any;
    createClUnitCode.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        clUnitCodesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (careerLevelId: number | null, unitCodeId: number | null) => {
    if (!selectedRow) return;
    const dto: UpdateClUnitCodeDto = {};
    if (careerLevelId != null) dto.careerLevelId = careerLevelId;
    if (unitCodeId != null) dto.unitCodeId = unitCodeId;

    updateClUnitCode.mutate(
      { id: selectedRow.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          clUnitCodesQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRow) return;
    deleteClUnitCode.mutate(selectedRow.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        clUnitCodesQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "careerLevel.career.name",
        header: "Career",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.careerLevel?.career?.name || "—"}>
              {row.original.careerLevel?.career?.name ?? "—"}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "careerLevel.level.name",
        header: "Level",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Level {row.original.careerLevel?.level?.name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "unitCode.code",
        header: "Unit Code",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => row.original.unitCode?.code ?? "—",
      },
      {
        accessorKey: "unitCode.name",
        header: "Unit Name",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => row.original.unitCode?.name ?? "—",
      },
      {
        accessorKey: "unitCode.description",
        header: "Unit description",
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => row.original.unitCode?.description ?? "—",
      },
      {
        id: "actions",
        header: () => (
          <span className="flex justify-end">
            <FiSettings className="w-4 h-4" />
          </span>
        ),
        cell: ({ row }: { row: { original: ClUnitCodeView } }) => (
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Career Level Unit Codes</h1>
            <p className="mt-1 text-sm text-gray-600">Map unit codes to each career level</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Button size="md" onClick={openAdd} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <FiPlus className="w-4 h-4" />
              Add Career Level Unit Code
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by career, level, or unit code..."
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
        <DataTable<ClUnitCodeView>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage} // must return { data: ClUnitCodeView[]; total }
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      <AddEditCLUnitCodeModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCareerLevelId={selectedRow?.careerLevel?.id ?? null}
        initialUnitCodeId={selectedRow?.unitCode?.id ?? null}
        onClose={closeModal}
        onConfirm={(careerLevelId, unitCodeId) => (modalType === "add" ? confirmAdd(careerLevelId, unitCodeId) : confirmEdit(careerLevelId, unitCodeId))}
        isLoading={createClUnitCode.status === "pending" || updateClUnitCode.status === "pending"}
      />

      <DeleteCLUnitCodeModal
        isOpen={modalType === "delete"}
        label={
          selectedRow
            ? `${selectedRow.careerLevel?.career?.name ?? "Unknown Career"} / Level ${selectedRow.careerLevel?.level?.name ?? "-"} / ${selectedRow.unitCode?.code ?? "UC"} ${
                selectedRow.unitCode?.name ?? ""
              }`
            : undefined
        }
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteClUnitCode.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
