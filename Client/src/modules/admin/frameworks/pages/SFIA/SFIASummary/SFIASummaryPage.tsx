import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { Input, DataTable, Toast } from "@Components/Admin/Common/ExportComponent";
import { useSFIASummaryManager } from "modules/admin/frameworks/hooks/sfia/useSFIASummaryHooks";
import { SFIASummary } from "modules/admin/frameworks/types/sfia/sfiaSummaryTypes";

export default function SFIASummaryPage() {
  const [searchText, setSearchText] = useState<string>("");
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>("");
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

  const { fetchPage } = useSFIASummaryManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: SFIASummary } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "userId",
        header: "User Email",
        cell: ({ row }: { row: { original: SFIASummary } }) => <span className="text-sm">{row.original.userId || "—"}</span>,
      },
      {
        accessorKey: "skillCode",
        header: "Skill Code",
        cell: ({ row }: { row: { original: SFIASummary } }) => <span className="font-mono">{row.original.skillCode}</span>,
      },
      { accessorKey: "levelId", header: "Level ID" },
      {
        accessorKey: "skillPercent",
        header: "Skill %",
        cell: ({ row }: { row: { original: SFIASummary } }) => {
          const pStr = row.original.skillPercent ?? "0";
          const pNum = Number.isFinite(Number(pStr)) ? Number(pStr).toFixed(2) : pStr;
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{pNum}%</span>;
        },
      },
    ],
    []
  );
  return (
    <AdminLayout>
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">SFIA Summary</h1>
            <p className="mt-1 text-sm text-gray-600">Read-only overview of user SFIA skill progress</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by email or skill code..."
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
        <DataTable<SFIASummary>
          key={debouncedSearchText}
          resetTrigger={debouncedSearchText}
          fetchPage={fetchPage}
          columns={columns}
          pageSizes={[5, 10, 20, 50]}
          initialPageSize={perPage}
          onPageChange={(newPageIndex) => setPage(newPageIndex + 1)}
        />
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AdminLayout>
  );
}
