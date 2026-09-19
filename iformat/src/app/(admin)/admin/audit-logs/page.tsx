"use client";

import { useEffect, useState } from "react";
import {
  History,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService, AdminAuditLogDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFilterBar,
  Pagination,
  Skeleton,
} from "@/components/ui/table";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (targetTypeFilter !== "ALL") {
        params.targetType = targetTypeFilter;
      }

      const res = await adminService.listAuditLogs(params);
      if (res) {
        const list = Array.isArray(res) ? res : res.logs || [];
        setLogs(list);
        if (res.meta?.total !== undefined) {
          setTotalCount(res.meta.total);
        } else {
          setTotalCount(list.length);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, pageSize, targetTypeFilter]);

  const handleRefresh = () => {
    loadLogs();
  };

  const filteredLogs = logs.filter((log) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      log.action?.toLowerCase().includes(q) ||
      log.targetType?.toLowerCase().includes(q) ||
      log.targetId?.toLowerCase().includes(q) ||
      log.admin?.name?.toLowerCase().includes(q) ||
      log.admin?.email?.toLowerCase().includes(q) ||
      log.ipAddress?.toLowerCase().includes(q)
    );
  });

  const filterTabs = [
    { key: "ALL", label: "All Activities" },
    { key: "USER", label: "User Moderation" },
    { key: "JOB", label: "Job Actions" },
    { key: "SUBSCRIPTION", label: "Subscriptions" },
    { key: "PLAN", label: "Plans" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Security & Audit Trail"
        description="Immutable log recording every administrative moderation, suspension, soft-delete, and plan update."
      >
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 rounded-xl shadow-xs cursor-pointer"
        >
          <History className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Log
        </Button>
      </AdminPageHeader>

      <TableFilterBar
        tabs={filterTabs}
        activeTab={targetTypeFilter}
        onTabChange={(tab) => {
          setTargetTypeFilter(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by action, admin, target ID, IP..."
      />

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Target Resource</TableHead>
              <TableHead>Administrator</TableHead>
              <TableHead>Timestamp & IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              /* UI-Preserving Skeleton Loading Rows */
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`audit-skeleton-${idx}`} className="hover:bg-transparent">
                  {/* Action */}
                  <TableCell>
                    <Skeleton className="h-6 w-28 rounded-lg" />
                  </TableCell>

                  {/* Target Resource */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>

                  {/* Administrator */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                  </TableCell>

                  {/* Timestamp & IP */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20 font-mono" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : filteredLogs.length === 0 ? (
              /* Empty State */
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={4} className="p-0 border-none">
                  <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-400 flex items-center justify-center shadow-xs">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">No Audit Records Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No log entries match your selected filter criteria.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {log.action?.replace(/_/g, " ")}
                    </span>
                  </TableCell>

                  <TableCell>
                    <p className="font-bold text-slate-900">
                      {log.targetType}: <span className="font-mono text-slate-500 text-xs">{log.targetId}</span>
                    </p>
                    {log.details && (
                      <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-xs">
                        {JSON.stringify(log.details)}
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <p className="font-semibold text-slate-800">{log.admin?.name || "Admin"}</p>
                    <p className="text-slate-500 text-xs">{log.admin?.email}</p>
                  </TableCell>

                  <TableCell className="text-slate-500 text-xs">
                    <div>{new Date(log.createdAt).toLocaleString()}</div>
                    {log.ipAddress && <div className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</div>}
                  </TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
      </div>

      <Pagination
        card
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount || filteredLogs.length}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}
