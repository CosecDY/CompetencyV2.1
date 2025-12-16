import { useEffect, useMemo, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { AdminLayout } from "@Layouts/AdminLayout";
import { Input, DataTable, Toast } from "@Components/Admin/Common/ExportComponent";
import { useTPQISummaryManager } from "modules/admin/frameworks/hooks/tpqi/useTPQISummaryHooks";
import { TPQISummary } from "modules/admin/frameworks/types/tpqi/tpqiSummaryTypes";

export default function TpqiSummaryPage() {
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

  const { fetchPage } = useTPQISummaryManager({ search: debouncedSearchText, page, perPage }, handleToast);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }: { row: { original: TPQISummary } }) => <span className="font-mono text-sm">{row.original.id}</span>,
      },
      {
        accessorKey: "userEmail",
        header: "User Email",
        cell: ({ row }: { row: { original: TPQISummary } }) => <span className="text-sm">{row.original.userEmail || "—"}</span>,
      },
      { accessorKey: "careerId", header: "Career ID" },
      { accessorKey: "levelId", header: "Level ID" },
      { accessorKey: "careerLevelId", header: "CareerLevel ID" },
      {
        accessorKey: "skillPercent",
        header: "Skill %",
        cell: ({ row }: { row: { original: TPQISummary } }) => {
          const p = row.original.skillPercent ?? "0";
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">{p}%</span>;
        },
      },
      {
        accessorKey: "knowledgePercent",
        header: "Knowledge %",
        cell: ({ row }: { row: { original: TPQISummary } }) => {
          const p = row.original.knowledgePercent ?? "0";
          return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-800">{p}%</span>;
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
            <h1 className="text-3xl font-bold text-gray-900 font-Poppins">TPQI Summary</h1>
            <p className="mt-1 text-sm text-gray-600">Read-only overview of user TPQI summary</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <div className="relative w-full sm:w-80">
              <Input
                type="text"
                placeholder="Search by user email..."
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
        <DataTable<TPQISummary>
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
