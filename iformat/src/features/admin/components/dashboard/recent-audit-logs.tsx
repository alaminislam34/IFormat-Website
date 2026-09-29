import React from "react";
import Link from "next/link";
import { History, ArrowUpRight } from "lucide-react";
import { AdminAuditLogDTO } from "@/services/admin.service";

interface RecentAuditLogsProps {
  logs: AdminAuditLogDTO[];
}

export function RecentAuditLogs({ logs }: RecentAuditLogsProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Administrative Audit Logs</h3>
            <p className="text-xs text-slate-500">Immutable record of security and moderation actions.</p>
          </div>
        </div>

        <Link
          href="/admin/audit-logs"
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
        >
          <span>View All Logs</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">
          No administrative actions recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                  {log.action.replace(/_/g, " ")}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-600 truncate">
                    Target: <span className="font-semibold text-slate-900">{log.targetType}</span> ({log.targetId})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Performed by <span className="text-slate-700 font-semibold">{log.admin?.name}</span> ({log.admin?.email})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 text-xs text-slate-500">
                {new Date(log.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
