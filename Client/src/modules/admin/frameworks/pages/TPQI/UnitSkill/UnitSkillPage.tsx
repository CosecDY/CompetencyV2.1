import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useUnitSkillManager } from "modules/admin/frameworks/hooks/tpqi/useUnitSkillHooks";
import { UnitSkillView, CreateUnitSkillDto, UpdateUnitSkillDto } from "modules/admin/frameworks/types/tpqi/unitSkillTypes";
import { AddEditUnitSkillModal, DeleteUnitSkillModal } from "./UnitSkillModals";

export default function UnitSkillPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selectedRow, setSelectedRow] = useState<UnitSkillView | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, unitSkillsQuery, createUnitSkill, updateUnitSkill, deleteUnitSkill } = useUnitSkillManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const openAdd = () => {
    setSelectedRow(null);
    setModalType("add");
  };
  const openEdit = (row: UnitSkillView) => {
    setSelectedRow(row);
    setModalType("edit");
  };
  const openDelete = (row: UnitSkillView) => {
    setSelectedRow(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelectedRow(null);
  };

  const confirmAdd = (unitCodeId: number | null, skillId: number | null) => {
    const dto: CreateUnitSkillDto = {
      unitCodeId: unitCodeId!,
      skillId: skillId!,
    };

    createUnitSkill.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        unitSkillsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to create: ${err?.message || ""}`, "error"),
    });
  };

  const confirmEdit = (unitCodeId: number | null, skillId: number | null) => {
    if (!selectedRow) return;
    const dto: UpdateUnitSkillDto = {
      unitCodeId: unitCodeId!,
      skillId: skillId!,
    };

    updateUnitSkill.mutate(
      { id: selectedRow.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          unitSkillsQuery.refetch();
        },
        onError: (err: any) => handleToast(`Failed to update: ${err?.message || ""}`, "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selectedRow) return;

    deleteUnitSkill.mutate(selectedRow.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        unitSkillsQuery.refetch();
      },
      onError: (err: any) => handleToast(`Failed to delete: ${err?.message || ""}`, "error"),
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: UnitSkillView } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "unitCode.code",
        header: "Unit Code",
        cell: ({ row }: { row: { original: UnitSkillView } }) => row.original.UnitCode?.code ?? "—",
      },
      {
        accessorKey: "unitCode.name",
        header: "Unit Name",
        cell: ({ row }: { row: { original: UnitSkillView } }) => row.original.UnitCode?.name ?? "—",
      },
      {
        accessorKey: "skill.name",
        header: "Skill",
        cell: ({ row }: { row: { original: UnitSkillView } }) => (
          <div className="max-w-xs">
            <span className="text-sm" title={row.original.Skill?.name || "—"}>
              {row.original.Skill?.name ?? "—"}
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
        cell: ({ row }: { row: { original: UnitSkillView } }) => (
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Unit & Skill</h1>
            <p className="mt-1 text-sm text-gray-600">Map unit codes to skills</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <Button
              size="md"
              onClick={() => {
                setSelectedRow(null);
                setModalType("add");
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <FiPlus className="w-4 h-4" />
              Add Unit–Skill
            </Button>
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by unit code/name or skill..."
                className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <FiSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
          </div>
        </div>
      </div>

      <DataTable<UnitSkillView>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20, 50]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditUnitSkillModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialUnitCode={selectedRow?.unitCodeId ?? null}
        initialSkillId={selectedRow?.skillId ?? null}
        onClose={closeModal}
        onConfirm={(unitCode, skillId) => (modalType === "add" ? confirmAdd(unitCode, skillId) : confirmEdit(unitCode, skillId))}
        isLoading={createUnitSkill.status === "pending" || updateUnitSkill.status === "pending"}
      />

      <DeleteUnitSkillModal
        isOpen={modalType === "delete"}
        label={selectedRow ? `${selectedRow.UnitCode?.code ?? ""} ${selectedRow.UnitCode?.name ?? ""} ↔ ${selectedRow.Skill?.name ?? "Unknown"}` : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteUnitSkill.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
