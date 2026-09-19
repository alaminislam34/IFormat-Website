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
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService, AdminAuditLogDTO } from "@/services/admin.service";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AdminAuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await adminService.listAuditLogs({ limit: 50 });
      if (res) {
        setLogs(Array.isArray(res) ? res : res.logs || []);
      }
    } catch (err: any) {
      toast.error(err?.message || "Could not load audit logs.");
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Security & Audit Trail
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Immutable log recording every administrative moderation, suspension, soft-delete, and plan update.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadLogs}
          disabled={loading}
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 rounded-xl shadow-xs cursor-pointer"
        >
          <History className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Log
        </Button>
      </div>

      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500 font-medium">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Administrator</th>
                  <th className="p-4">Timestamp & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-slate-900">
                        {log.targetType}: <span className="font-mono text-slate-500 text-xs">{log.targetId}</span>
                      </p>
                      {log.details && (
                        <p className="text-xs text-slate-500 mt-0.5 font-mono truncate max-w-xs">
                          {JSON.stringify(log.details)}
                        </p>
                      )}
                    </td>

                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{log.admin?.name || "Admin"}</p>
                      <p className="text-slate-500 text-xs">{log.admin?.email}</p>
                    </td>

                    <td className="p-4 text-slate-500 text-xs">
                      <div>{new Date(log.createdAt).toLocaleString()}</div>
                      {log.ipAddress && <div className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress}</div>}
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
