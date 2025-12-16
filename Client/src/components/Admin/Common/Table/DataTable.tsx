import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import Select from "../Select/Select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface DataTableProps<T> {
  fetchPage: (pageIndex: number, pageSize: number) => Promise<{ data: T[]; total: number }>;
  columns: ColumnDef<T>[];
  pageSizes?: number[];
  initialPageSize?: number;
  initialPrefetchPages?: number;
  onPageChange?: (newPageIndex: number) => void;
  resetTrigger?: unknown;
}

function DataTable<T extends object>({ fetchPage, columns, pageSizes = [5, 10, 20, 50], initialPageSize = 10, initialPrefetchPages = 3, onPageChange, resetTrigger }: DataTableProps<T>) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);
  const [cache, setCache] = useState<Record<number, T[]>>({});
  const [errorPages, setErrorPages] = useState<Record<number, string>>({});
  const [totalRows, setTotalRows] = useState(0);

  const loadingPagesRef = useRef<Set<number>>(new Set());

  // Reset cache on trigger
  useEffect(() => {
    setCache({});
    setPageIndex(0);
    loadingPagesRef.current.clear();
  }, [resetTrigger]);

  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

  // Sliding window prefetch
  const loadPagesSlidingWindow = useCallback(
    async (startPage: number) => {
      const pagesToLoad: number[] = [];
      for (let i = 0; i < initialPrefetchPages; i++) {
        const idx = startPage + i;
        if (!loadingPagesRef.current.has(idx) && !cache[idx] && idx < totalPages) pagesToLoad.push(idx);
      }
      if (pagesToLoad.length === 0) return;

      pagesToLoad.forEach((idx) => loadingPagesRef.current.add(idx));

      try {
        for (const idx of pagesToLoad) {
          const result = await fetchPage(idx, pageSize);
          setCache((prev) => ({ ...prev, [idx]: result.data }));
          setTotalRows(result.total);
          setErrorPages((prev) => {
            const copy = { ...prev };
            delete copy[idx];
            return copy;
          });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error loading data";
        setErrorPages((prev) => {
          const copy = { ...prev };
          pagesToLoad.forEach((idx) => (copy[idx] = message));
          return copy;
        });
      } finally {
        pagesToLoad.forEach((idx) => loadingPagesRef.current.delete(idx));
      }
    },
    [fetchPage, pageSize, initialPrefetchPages, cache, totalPages]
  );

  // Prefetch initial pages
  useEffect(() => {
    loadPagesSlidingWindow(0);
  }, [loadPagesSlidingWindow, resetTrigger]);

  const table = useReactTable({
    data: cache[pageIndex] ?? [],
    columns,
    pageCount: totalPages,
    state: { pagination: { pageIndex, pageSize } },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      if (next.pageIndex !== pageIndex) {
        setPageIndex(next.pageIndex);
        onPageChange?.(next.pageIndex);
        loadPagesSlidingWindow(next.pageIndex); // sliding window
      }
      if (next.pageSize !== pageSize) {
        setPageSize(next.pageSize);
        setCache({});
        setPageIndex(0);
        loadPagesSlidingWindow(0);
      }
    },
  });

  const startRow = pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  const renderPageButtons = () => {
    const maxButtons = 7;
    const buttons: (number | "...")[] = [];
    if (totalPages <= maxButtons) {
      for (let i = 0; i < totalPages; i++) buttons.push(i);
    } else {
      const left = Math.max(1, pageIndex - 2);
      const right = Math.min(totalPages - 2, pageIndex + 2);
      buttons.push(0);
      if (left > 1) buttons.push("...");
      for (let i = left; i <= right; i++) buttons.push(i);
      if (right < totalPages - 2) buttons.push("...");
      buttons.push(totalPages - 1);
    }
    return buttons.map((b, idx) =>
      typeof b === "number" ? (
        <button
          key={idx}
          onClick={() => table.setPageIndex(b)}
          className={`px-3 py-2 rounded-lg text-sm font-medium ${b === pageIndex ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-200"} transition-colors`}
        >
          {b + 1}
        </button>
      ) : (
        <span key={idx} className="px-2 text-gray-500">
          {b}
        </span>
      )
    );
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-visible">
      <div className="overflow-x-auto shadow rounded-t-xl">
        <table className="min-w-full divide-y divide-gray-200 rounded-t-xl">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th key={header.id} className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider ${header.id === "actions" ? "text-right" : "text-left"}`}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {loadingPagesRef.current.has(pageIndex) ? (
              Array.from({ length: pageSize }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`} className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-25"}>
                  {columns.map((_, colIdx) => (
                    <td key={colIdx} className="px-6 py-4">
                      <Skeleton height={16} />
                    </td>
                  ))}
                </tr>
              ))
            ) : errorPages[pageIndex] ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <FiAlertTriangle className="w-12 h-12 text-red-500" />
                    <p className="text-lg font-semibold text-red-600">{errorPages[pageIndex]}</p>
                    <button onClick={() => loadPagesSlidingWindow(pageIndex)} className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-3xl hover:bg-red-700">
                      <FiRefreshCw className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center space-y-3 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200">
                    <FiAlertTriangle className="w-10 h-10 text-gray-400" />
                    <p className="text-base font-semibold text-gray-700">No data available</p>
                    <p className="text-sm text-gray-500">Try adjusting filters or search</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {table.getRowModel().rows.map((row, idx) => (
                  <tr key={row.id} className={`transition-colors duration-150 hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-25"}`}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 overflow-hidden truncate max-w-xs">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}

                {table.getRowModel().rows.length < pageSize &&
                  Array.from({ length: pageSize - table.getRowModel().rows.length }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className={(table.getRowModel().rows.length + idx) % 2 === 0 ? "bg-white" : "bg-gray-25"}>
                      {columns.map((_, colIdx) => (
                        <td key={colIdx} className="px-6 py-4">
                          &nbsp;
                        </td>
                      ))}
                    </tr>
                  ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Show:</label>
              <Select
                value={pageSize}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCache({});
                  setPageIndex(0);
                  loadPagesSlidingWindow(0);
                }}
                options={pageSizes.map((s) => ({ label: `${s} rows`, value: s }))}
                className="w-30 px-3 py-1.5 text-sm bg-gray-50 text-gray-600"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium text-gray-900">{totalRows ? startRow : 0}</span> to <span className="font-medium text-gray-900">{endRow}</span> of{" "}
              <span className="font-medium text-gray-900">{totalRows}</span> results
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={pageIndex === 0}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={pageIndex === 0}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {renderPageButtons()}

            <button
              onClick={() => table.nextPage()}
              disabled={pageIndex === totalPages - 1}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => table.setPageIndex(totalPages - 1)}
              disabled={pageIndex === totalPages - 1}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
