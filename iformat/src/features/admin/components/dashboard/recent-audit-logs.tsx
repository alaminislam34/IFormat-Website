import React from "react";
import Link from "next/link";
import { History, ArrowUpRight } from "lucide-react";
import { AdminAuditLogDTO } from "@/services/admin.service";

interface RecentAuditLogsProps {
  logs: AdminAuditLogDTO[];
}

export function RecentAuditLogs({ logs }: RecentAuditLogsProps) {
  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recent Administrative Audit Logs</h3>
            <p className="text-[11px] text-slate-500">Immutable record of security and moderation actions.</p>
          </div>
        </div>

        <Link
          href="/admin/audit-logs"
          className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
        >
          View All Logs <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">
          No administrative actions recorded yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/60">
          {logs.map((log) => (
            <div key={log.id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                  {log.action.replace(/_/g, " ")}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">
                    Target: <span className="font-bold text-white">{log.targetType}</span> ({log.targetId})
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Performed by <span className="text-slate-400 font-semibold">{log.admin?.name}</span> ({log.admin?.email})
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0 text-[11px] text-slate-500">
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
