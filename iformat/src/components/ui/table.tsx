"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Inbox,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

// ==========================================
// 1. Primitive Table Components
// ==========================================

export const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & { containerClassName?: string }
>(({ className, containerClassName, ...props }, ref) => (
  <div className={cn("relative w-full overflow-x-auto", containerClassName)}>
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-left text-xs", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-slate-50/90 text-slate-500 font-semibold text-xs border-b border-slate-200/80 sticky top-0 z-10",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("divide-y divide-slate-100 bg-white", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

export const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-slate-200/80 bg-slate-50/50 font-medium text-slate-500",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

export const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { isClickable?: boolean }
>(({ className, isClickable, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-colors hover:bg-slate-50/80 data-[state=selected]:bg-slate-100",
      isClickable && "cursor-pointer",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

export const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "p-4 text-left align-middle font-semibold text-slate-500 text-xs select-none has-[[role=checkbox]]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

export const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-4 align-middle text-slate-700 text-xs has-[[role=checkbox]]:pr-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-xs text-slate-400 font-medium", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// ==========================================
// 2. Types for Declarative DataTable
// ==========================================

export interface DataTableColumn<T> {
  /** Unique column identifier. Defaults to accessorKey or index if omitted */
  id?: string;
  /** Header label or custom header render function */
  header: React.ReactNode | ((props: { column: DataTableColumn<T> }) => React.ReactNode);
  /** Key of the row object to extract value from */
  accessorKey?: keyof T;
  /** Custom function to extract value from the row */
  accessorFn?: (row: T) => any;
  /** Custom cell renderer */
  cell?: (props: { row: T; value: any; index: number }) => React.ReactNode;
  /** Custom className applied to <td> cells */
  className?: string;
  /** Custom className applied to <th> header cells */
  headerClassName?: string;
  /** Alignment of header and cell content */
  align?: "left" | "center" | "right";
  /** Whether the column can be sorted */
  sortable?: boolean;
  /** Custom sort key sent to onSort callback (defaults to id or accessorKey) */
  sortKey?: string;
  /** Optional column width (e.g., '120px', '25%') */
  width?: string;
}

export interface DataTablePaginationProps {
  pageIndex: number; // 1-indexed (1, 2, 3...)
  pageSize: number;
  totalCount?: number;
  pageCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  loading?: boolean;
  loadingRowsCount?: number;
  /** Empty state customization */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ElementType;
  emptyAction?: React.ReactNode;
  /** Row click handler */
  onRowClick?: (row: T, index: number) => void;
  /** Custom key generator for rows (defaults to row.id or index) */
  rowKey?: (row: T, index: number) => string | number;
  /** Sorting */
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string, direction: "asc" | "desc") => void;
  /** Pagination */
  pagination?: DataTablePaginationProps;
  /** Header & Toolbar */
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  /** Styling Flags */
  cardWrapper?: boolean;
  striped?: boolean;
  compact?: boolean;
  className?: string;
  containerClassName?: string;
}

// ==========================================
// 3. Declarative DataTable Component
// ==========================================

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  loadingRowsCount = 5,
  emptyTitle = "No records found",
  emptyDescription = "There are currently no items matching your criteria.",
  emptyIcon: EmptyIcon = Inbox,
  emptyAction,
  onRowClick,
  rowKey,
  sortColumn,
  sortDirection,
  onSort,
  pagination,
  title,
  subtitle,
  headerAction,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  cardWrapper = true,
  striped = false,
  compact = false,
  className,
  containerClassName,
}: DataTableProps<T>) {
  const getCellValue = (row: T, col: DataTableColumn<T>) => {
    if (col.accessorFn) return col.accessorFn(row);
    if (col.accessorKey) return row[col.accessorKey];
    return undefined;
  };

  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) return rowKey(row, index);
    if (row && typeof row === "object" && "id" in row && row.id) {
      return String(row.id);
    }
    return index;
  };

  const handleHeaderClick = (col: DataTableColumn<T>) => {
    if (!col.sortable || !onSort) return;
    const key = col.sortKey || col.id || (col.accessorKey as string);
    if (!key) return;

    if (sortColumn === key) {
      onSort(key, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  const tableMarkup = (
    <Table containerClassName={containerClassName} className={className}>
      <TableHeader>
        <TableRow className="hover:bg-slate-50/90">
          {columns.map((col, idx) => {
            const key = col.sortKey || col.id || (col.accessorKey as string);
            const isSorted = Boolean(key && sortColumn === key);
            const alignmentClass =
              col.align === "center"
                ? "text-center"
                : col.align === "right"
                ? "text-right"
                : "text-left";

            return (
              <TableHead
                key={col.id || (col.accessorKey as string) || idx}
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  alignmentClass,
                  compact ? "py-2.5 px-3" : "p-4",
                  col.sortable && "cursor-pointer hover:bg-slate-100/70 transition-colors select-none",
                  col.headerClassName
                )}
                onClick={() => handleHeaderClick(col)}
              >
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5",
                    col.align === "right" && "justify-end flex",
                    col.align === "center" && "justify-center flex"
                  )}
                >
                  {typeof col.header === "function" ? col.header({ column: col }) : col.header}
                  {col.sortable && (
                    <span className="text-slate-400">
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-sky-600" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                      )}
                    </span>
                  )}
                </div>
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>

      <TableBody>
        {loading ? (
          /* Animated Skeleton Loading Rows */
          Array.from({ length: loadingRowsCount }).map((_, rIdx) => (
            <TableRow key={`skeleton-row-${rIdx}`} className="hover:bg-transparent">
              {columns.map((col, cIdx) => (
                <TableCell
                  key={`skeleton-col-${cIdx}`}
                  className={cn(compact ? "py-3 px-3" : "p-4", col.className)}
                >
                  <div
                    className={cn(
                      "h-4 rounded-md bg-slate-200/70 animate-pulse",
                      cIdx === 0 ? "w-3/4" : cIdx % 2 === 0 ? "w-1/2" : "w-2/3"
                    )}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : data.length === 0 ? (
          /* Empty State */
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="p-0 border-none">
              <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center border border-slate-200/60 shadow-xs">
                  <EmptyIcon className="w-6 h-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                    {emptyTitle}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {emptyDescription}
                  </p>
                </div>
                {emptyAction && <div className="pt-1">{emptyAction}</div>}
              </div>
            </TableCell>
          </TableRow>
        ) : (
          /* Data Rows */
          data.map((row, rIdx) => {
            const key = getRowKey(row, rIdx);
            const isClickable = Boolean(onRowClick);

            return (
              <TableRow
                key={key}
                isClickable={isClickable}
                onClick={() => onRowClick && onRowClick(row, rIdx)}
                className={cn(
                  striped && rIdx % 2 === 1 && "bg-slate-50/40",
                  isClickable && "cursor-pointer active:bg-slate-100/60"
                )}
              >
                {columns.map((col, cIdx) => {
                  const val = getCellValue(row, col);
                  const alignmentClass =
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left";

                  return (
                    <TableCell
                      key={col.id || (col.accessorKey as string) || cIdx}
                      className={cn(
                        alignmentClass,
                        compact ? "py-2.5 px-3" : "p-4",
                        col.className
                      )}
                    >
                      {col.cell
                        ? col.cell({ row, value: val, index: rIdx })
                        : val !== undefined && val !== null
                        ? String(val)
                        : "—"}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <div
      className={cn(
        cardWrapper &&
          "bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs flex flex-col"
      )}
    >
      {/* Optional Card Toolbar / Header */}
      {(title || subtitle || headerAction || onSearchChange) && (
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shrink-0">
          {(title || subtitle) && (
            <div className="space-y-0.5">
              {title && (
                <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </div>
              )}
              {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
            {onSearchChange && (
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchValue || ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder || "Search..."}
                  className="w-full pl-9 pr-3 h-9 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Main Table Content */}
      {tableMarkup}

      {/* Optional Pagination Footer */}
      {pagination && (
        <DataTablePagination
          {...pagination}
          loading={loading}
          currentCount={data.length}
        />
      )}
    </div>
  );
}

// ==========================================
// 4. Pagination Subcomponent
// ==========================================

export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  pageCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  loading = false,
  currentCount = 0,
}: DataTablePaginationProps & { loading?: boolean; currentCount?: number }) {
  const computedPageCount =
    pageCount ??
    (totalCount !== undefined ? Math.ceil(totalCount / pageSize) || 1 : undefined);

  const canPreviousPage = pageIndex > 1 && !loading;
  const canNextPage =
    computedPageCount !== undefined
      ? pageIndex < computedPageCount && !loading
      : currentCount === pageSize && !loading;

  const startRecord = (pageIndex - 1) * pageSize + (currentCount > 0 ? 1 : 0);
  const endRecord = (pageIndex - 1) * pageSize + currentCount;

  return (
    <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
      {/* Record info & Page size selector */}
      <div className="flex items-center gap-3">
        {totalCount !== undefined ? (
          <span>
            Showing <strong className="font-semibold text-slate-800">{startRecord}</strong> to{" "}
            <strong className="font-semibold text-slate-800">{endRecord}</strong> of{" "}
            <strong className="font-semibold text-slate-800">{totalCount}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-slate-800">{pageIndex}</strong>
            {computedPageCount && ` of ${computedPageCount}`}
          </span>
        )}

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
            <span>Rows:</span>
            <select
              value={pageSize}
              disabled={loading}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
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

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={!canPreviousPage}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 cursor-pointer disabled:opacity-40 flex items-center justify-center"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="h-8 min-w-8 px-2 flex items-center justify-center font-bold text-xs text-white bg-[#0A54B1] rounded-lg shadow-xs shadow-blue-500/20">
          {pageIndex}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={!canNextPage}
          className="h-8 w-8 p-0 rounded-lg text-slate-600 cursor-pointer disabled:opacity-40 flex items-center justify-center"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export * from "./table-filter-bar";
export * from "./pagination";
export * from "./skeleton";

export default DataTable;

