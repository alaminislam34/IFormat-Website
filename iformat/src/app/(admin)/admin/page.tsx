"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminService, AdminMetricsDTO, AdminAuditLogDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { StatCardsGrid } from "@/features/admin/components/dashboard/stat-cards-grid";
import { QuickActionPanels } from "@/features/admin/components/dashboard/quick-action-panels";
import { RecentAuditLogs } from "@/features/admin/components/dashboard/recent-audit-logs";

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetricsDTO | null>(null);
  const [recentLogs, setRecentLogs] = useState<AdminAuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [m, logsRes] = await Promise.all([
        adminService.getMetrics(),
        adminService.listAuditLogs({ limit: 6 }),
      ]);
      setMetrics(m);
      if (logsRes?.logs) setRecentLogs(logsRes.logs);
    } catch (err: any) {
      console.warn("Could not fetch admin metrics:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading System Telemetry & Metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Command Center"
        description="Real-time platform oversight, monetization metrics, and system controls."
      >
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-2 h-10 px-4"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-sky-400" : ""}`} />
          Refresh Telemetry
        </Button>

        <Link href="/admin/plans">
          <Button className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold flex items-center gap-2 h-10 px-4 shadow-lg shadow-sky-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Manage Plans
          </Button>
        </Link>
      </AdminPageHeader>

      <StatCardsGrid metrics={metrics} />
      <QuickActionPanels metrics={metrics} />
      <RecentAuditLogs logs={recentLogs} />
    </div>
  );
}
