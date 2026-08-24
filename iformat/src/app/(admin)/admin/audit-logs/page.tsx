"use client";

import { useEffect, useState } from "react";
import {
  History,
  Search,
  Filter,
  Shield,
  Loader2,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { adminService, AdminAuditLogDTO } from "@/services/admin.service";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.listAuditLogs({ limit: 50 });
      if (res?.logs) setLogs(res.logs);
    } catch (err: any) {
      console.warn("Could not load audit logs:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Security & Audit Trail
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Immutable log recording every administrative moderation, suspension, soft-delete, and plan update.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Timestamp & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-white">
                        {log.targetType}: <span className="font-mono text-slate-400 text-[11px]">{log.targetId}</span>
                      </p>
                      {log.details && (
                        <p className="text-[11px] text-slate-500 mt-0.5 font-mono truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-300">{log.admin?.name || "Admin"}</p>
                      <p className="text-slate-500 text-[11px]">{log.admin?.email}</p>
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      <div>{new Date(log.createdAt).toLocaleString()}</div>
                      {log.ipAddress && <div className="text-[10px] text-slate-600 font-mono">IP: {log.ipAddress}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
