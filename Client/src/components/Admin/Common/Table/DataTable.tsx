import React, { useState, useEffect, useCallback, useRef } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight, FiAlertTriangle, FiRefreshCw, FiDatabase } from "react-icons/fi";
import Select from "../Select/Select";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const getRandomWidth = () => Math.floor(Math.random() * (90 - 40 + 1) + 40) + "%";

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

  useEffect(() => {
    setCache({});
    setPageIndex(0);
    loadingPagesRef.current.clear();
  }, [resetTrigger]);

  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);

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
        await Promise.all(
          pagesToLoad.map(async (idx) => {
            try {
              const result = await fetchPage(idx, pageSize);
              setCache((prev) => ({ ...prev, [idx]: result.data }));
              setTotalRows(result.total);
              setErrorPages((prev) => {
                const copy = { ...prev };
                delete copy[idx];
                return copy;
              });
            } catch (err) {
              const message = err instanceof Error ? err.message : "Error loading data";
              setErrorPages((prev) => ({ ...prev, [idx]: message }));
            } finally {
              loadingPagesRef.current.delete(idx);
            }
          })
        );
      } catch (err) {
        console.error("Critical batch loading error", err);
      }
    },
    [fetchPage, pageSize, initialPrefetchPages, cache, totalPages]
  );

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
        loadPagesSlidingWindow(next.pageIndex);
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
          className={`
            min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200
            ${b === pageIndex ? "bg-primary text-white shadow-md shadow-primary-shadow scale-105" : "text-gray-500 hover:bg-primary-light hover:text-primary"}
          `}
        >
          {b + 1}
        </button>
      ) : (
        <span key={idx} className="px-2 text-gray-400 select-none">
          {b}
        </span>
      )
    );
  };

  const isLoadingCurrentPage = loadingPagesRef.current.has(pageIndex);
  const isErrorCurrentPage = !!errorPages[pageIndex];
  const isEmptyData = !isLoadingCurrentPage && !isErrorCurrentPage && table.getRowModel().rows.length === 0;

  return (
    <div className="flex flex-col gap-4 font-sans">
      <div className="bg-white shadow-soft border border-gray-100 rounded-xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-white sticky top-0 z-10">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`
                        px-6 py-5 text-xs font-bold uppercase tracking-wider text-navy opacity-80
                        ${header.id === "actions" ? "text-right" : "text-left"}
                      `}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="bg-white divide-y divide-gray-50 text-gray-600">
              {isLoadingCurrentPage ? (
                // Skeleton
                Array.from({ length: pageSize }).map((_, rowIdx) => (
                  <tr key={`skeleton-${rowIdx}`}>
                    {columns.map((_, colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        <Skeleton
                          height={20}
                          width={getRandomWidth()}
                          baseColor="#f8fafc" // Slate-50
                          highlightColor="#e2e8f0" // Slate-200
                          borderRadius={4}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : isErrorCurrentPage ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="p-3 bg-status-gold/10 rounded-full">
                        <FiAlertTriangle className="w-8 h-8 text-status-gold" />
                      </div>
                      <div className="text-center">
                        <p className="text-navy font-medium">Failed to load data</p>
                        <p className="text-sm text-status-gold mt-1">{errorPages[pageIndex]}</p>
                      </div>
                      <button
                        onClick={() => loadPagesSlidingWindow(pageIndex)}
                        className="mt-2 inline-flex items-center space-x-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-hover transition-colors shadow-sm"
                      >
                        <FiRefreshCw className="w-4 h-4" />
                        <span>Try Again</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : isEmptyData ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="p-4 bg-status-teal/10 rounded-full">
                        <FiDatabase className="w-10 h-10 text-status-teal" />
                      </div>
                      <div>
                        <p className="text-base font-semibold text-navy">No data found</p>
                        <p className="text-sm text-gray-500 mt-1">No records available.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                <>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="group transition-colors duration-200 hover:bg-primary-light/50">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 group-hover:text-navy">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}

                  {table.getRowModel().rows.length < pageSize &&
                    Array.from({ length: pageSize - table.getRowModel().rows.length }).map((_, idx) => (
                      <tr key={`spacer-${idx}`}>
                        <td colSpan={columns.length} className="px-6 py-4">
                          &nbsp;
                        </td>
                      </tr>
                    ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            {/* Rows Per Page */}
            <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Rows:</span>
                <Select
                  value={pageSize}
                  onChange={(val) => {
                    setPageSize(Number(val));
                    setCache({});
                    setPageIndex(0);
                    loadPagesSlidingWindow(0);
                  }}
                  options={pageSizes.map((s) => ({ label: `${s}`, value: s }))}
                  className="w-20 px-2 py-1 text-sm bg-white text-navy rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div className="hidden sm:block h-4 w-px bg-gray-200"></div>

              <div className="text-sm text-gray-500">
                <span className="font-medium text-navy">{totalRows ? startRow : 0}</span>-<span className="font-medium text-navy">{endRow}</span> of{" "}
                <span className="font-medium text-navy">{totalRows}</span>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={pageIndex === 0 || isLoadingCurrentPage}
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronsLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={pageIndex === 0 || isLoadingCurrentPage}
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center px-2 space-x-1">{renderPageButtons()}</div>

              <button
                onClick={() => table.nextPage()}
                disabled={pageIndex === totalPages - 1 || isLoadingCurrentPage}
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={pageIndex === totalPages - 1 || isLoadingCurrentPage}
                className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-primary-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <FiChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
