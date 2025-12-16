import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiSearch, FiSettings } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { RowActions, Button, Input, Toast, DataTable } from "@Components/Admin/Common/ExportComponent";
import { useCareerManager } from "modules/admin/frameworks/hooks/tpqi/useCareerHooks";
import { Career, CreateCareerDto, UpdateCareerDto } from "modules/admin/frameworks/types/tpqi/careerTypes";
import { AddEditCareerListModal, DeleteCareerListModal } from "./CareerModals";

export default function CareerPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
  const [modalType, setModalType] = useState<"add" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<Career | null>(null);
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchText(searchText), 500);
    return () => clearTimeout(t);
  }, [searchText]);

  useEffect(() => setPage(1), [debouncedSearchText]);

  const handleToast = (message: string, type: "success" | "error" | "info" = "info") => setToast({ message, type });

  const { fetchPage, carrerQuery, createCareer, updateCareer, deleteCareer } = useCareerManager({ search: debouncedSearchText, page, perPage }, handleToast);

  // Modals
  const openAdd = () => {
    setSelected(null);
    setModalType("add");
  };
  const openEdit = (row: any) => {
    setSelected(row);
    setModalType("edit");
  };
  const openDelete = (row: any) => {
    setSelected(row);
    setModalType("delete");
  };
  const closeModal = () => {
    setModalType(null);
    setSelected(null);
  };

  // Updated to match modal's expected signature
  const confirmAdd = (payload: { careerId: number; name: string }) => {
    const dto: CreateCareerDto = {
      careerId: payload.careerId,
      name: payload.name,
    } as any;
    createCareer.mutate(dto, {
      onSuccess: () => {
        handleToast("Created successfully", "success");
        closeModal();
        carrerQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to create: " + (err?.message || ""), "error"),
    });
  };

  const confirmEdit = (payload: { careerId: number; name: string }) => {
    if (!selected) return;
    const dto: UpdateCareerDto = {
      careerId: payload.careerId,
      name: payload.name,
    } as any;
    updateCareer.mutate(
      { id: selected.id, data: dto },
      {
        onSuccess: () => {
          handleToast("Updated successfully", "success");
          closeModal();
          carrerQuery.refetch();
        },
        onError: (err: any) => handleToast("Failed to update: " + (err?.message || ""), "error"),
      }
    );
  };

  const confirmDelete = () => {
    if (!selected) return;
    deleteCareer.mutate(selected.id, {
      onSuccess: () => {
        handleToast("Deleted successfully", "success");
        closeModal();
        carrerQuery.refetch();
      },
      onError: (err: any) => handleToast("Failed to delete: " + (err?.message || ""), "error"),
    });
  };

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "ID" },
      {
        accessorKey: "name",
        header: "Career Name",
        cell: ({ row }: { row: { original: any } }) => row.original?.name ?? "-",
      },
      {
        id: "actions",
        header: () => (
          <span style={{ float: "right" }}>
            <FiSettings />
          </span>
        ),
        cell: ({ row }: { row: { original: any } }) => (
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
          <h1 className="text-3xl font-bold text-gray-900 font-Poppins">Career List</h1>
          <p className="mt-1 text-sm text-gray-600">Manage career</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Button size="md" onClick={openAdd} className="flex items-center">
            <FiPlus className="mr-2" /> Add Career
          </Button>
          <div className="relative">
            <Input type="text" placeholder="Search by career name..." className="py-1 pl-3 text-sm pr-30" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            <FiSearch className="absolute text-gray-400 -translate-y-1/2 right-2 top-1/2" />
          </div>
        </div>
      </div>

      <DataTable<any>
        key={debouncedSearchText}
        resetTrigger={debouncedSearchText}
        fetchPage={fetchPage}
        columns={columns}
        pageSizes={[5, 10, 20]}
        initialPageSize={perPage}
        onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
      />

      <AddEditCareerListModal
        isOpen={modalType === "add" || modalType === "edit"}
        mode={modalType === "edit" ? "edit" : "add"}
        initialCareerId={selected?.id ?? null}
        initialName={selected?.name ?? null}
        onClose={closeModal}
        onConfirm={modalType === "edit" ? confirmEdit : confirmAdd}
        isLoading={createCareer.status === "pending" || updateCareer.status === "pending"}
      />

      <DeleteCareerListModal
        isOpen={modalType === "delete"}
        label={selected ? selected.name ?? "Unknown career" : undefined}
        onClose={closeModal}
        onConfirm={confirmDelete}
        isLoading={deleteCareer.status === "pending"}
      />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
