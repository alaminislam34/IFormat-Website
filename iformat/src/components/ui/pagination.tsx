"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Number of items per page */
  pageSize: number;
  /** Total items count across all pages */
  totalCount?: number;
  /** Explicit total pages count (calculated from totalCount / pageSize if omitted) */
  pageCount?: number;
  /** Page change callback */
  onPageChange: (page: number) => void;
  /** Page size change callback */
  onPageSizeChange?: (size: number) => void;
  /** Available page size options in dropdown */
  pageSizeOptions?: number[];
  /** Whether data is currently loading (disables buttons) */
  loading?: boolean;
  /** Show the "Showing X to Y of Z entries" text */
  showRecordCount?: boolean;
  /** Show first and last quick jump buttons */
  showFirstLastButtons?: boolean;
  /** Visual wrapper style */
  card?: boolean;
  className?: string;
}

/**
 * Generates an array of page numbers with ellipsis (e.g. [1, 2, '...', 8, 9, 10, '...', 25])
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always show first and last page
  const pages: (number | string)[] = [];

  if (currentPage <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i);
    pages.push("...");
    pages.push(totalPages);
  } else if (currentPage >= totalPages - 3) {
    pages.push(1);
    pages.push("...");
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    pages.push("...");
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);
    pages.push("...");
    pages.push(totalPages);
  }

  return pages;
}

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  loading = false,
  showRecordCount = true,
  showFirstLastButtons = false,
  card = false,
  className,
}: PaginationProps) {
  const totalPages =
    pageCount ??
    (totalCount !== undefined ? Math.ceil(totalCount / pageSize) || 1 : 1);

  const canPrev = currentPage > 1 && !loading;
  const canNext = currentPage < totalPages && !loading;

  const currentRecordsOnPage =
    totalCount !== undefined
      ? Math.min(pageSize, Math.max(0, totalCount - (currentPage - 1) * pageSize))
      : pageSize;

  const startRecord = (currentPage - 1) * pageSize + (currentRecordsOnPage > 0 ? 1 : 0);
  const endRecord = (currentPage - 1) * pageSize + currentRecordsOnPage;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500",
        card &&
          "bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs",
        className
      )}
    >
      {/* Left: Record Count & Page Size Dropdown */}
      <div className="flex items-center gap-3 flex-wrap">
        {showRecordCount && (
          <span>
            {totalCount !== undefined ? (
              <>
                Showing <strong className="font-bold text-slate-800">{startRecord}</strong> to{" "}
                <strong className="font-bold text-slate-800">{endRecord}</strong> of{" "}
                <strong className="font-bold text-slate-800">{totalCount}</strong> results
              </>
            ) : (
              <>
                Page <strong className="font-bold text-slate-800">{currentPage}</strong> of{" "}
                <strong className="font-bold text-slate-800">{totalPages}</strong>
              </>
            )}
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>Per page:</span>
            <select
              value={pageSize}
              disabled={loading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer transition-colors"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* First Page Button */}
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canPrev}
            className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40 cursor-pointer"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Previous Page Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40 cursor-pointer flex items-center justify-center"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Numbered Page Buttons with Ellipsis */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-slate-400 font-bold select-none"
                >
                  ...
                </span>
              );
            }

            const isCurrent = p === currentPage;

            return (
              <button
                key={`page-${p}`}
                type="button"
                disabled={loading}
                onClick={() => onPageChange(Number(p))}
                className={cn(
                  "h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none",
                  isCurrent
                    ? "bg-[#0A54B1] text-white shadow-xs shadow-blue-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-transparent"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40 cursor-pointer flex items-center justify-center"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>

        {/* Last Page Button */}
        {showFirstLastButtons && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canNext}
            className="h-8 w-8 p-0 rounded-lg text-slate-600 disabled:opacity-40 cursor-pointer"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
