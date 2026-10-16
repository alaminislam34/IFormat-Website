"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService, AiAnalyticsDTO } from "@/services/admin.service";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import { AiKpiGrid } from "@/features/admin/components/ai-analytics/ai-kpi-grid";
import { AiDailyChart } from "@/features/admin/components/ai-analytics/ai-daily-chart";
import {
  AiFeatureTable,
  AiPlanTable,
  AiRecentErrors,
  AiRecentFeedback,
  AiTopUsersTable,
} from "@/features/admin/components/ai-analytics/ai-breakdown-tables";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const RANGES = [7, 30, 90] as const;

export default function AdminAiAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AiAnalyticsDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setData(await adminService.getAiAnalytics(days));
    } catch (err: any) {
      toast.error(err?.message || "Could not load AI analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const showCost = data?.costRatePer1MTokensUsd != null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="AI Analytics"
        description="Usage, cost and quality of every AI feature. Prompts and generated content are not stored."
      >
        <div className="flex items-center rounded-xl border border-slate-200 bg-white p-0.5">
          {RANGES.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setDays(range)}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-bold cursor-pointer transition-colors",
                days === range ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {range}d
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={load}
          disabled={loading}
          className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 rounded-xl shadow-xs cursor-pointer"
        >
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", loading && "animate-spin")} />
          Refresh
        </Button>
      </AdminPageHeader>

      {!data ? (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-36 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      ) : (
        <div className={cn("space-y-5 transition-opacity", loading && "opacity-60")}>
          <AiKpiGrid data={data} />
          <AiDailyChart daily={data.daily} rangeDays={data.rangeDays} />
          <AiFeatureTable features={data.features} showCost={showCost} />
          <div className="grid lg:grid-cols-2 gap-5">
            <AiPlanTable plans={data.plans} showCost={showCost} />
            <AiTopUsersTable users={data.topUsers} showCost={showCost} />
          </div>
          <div className="grid lg:grid-cols-2 gap-5">
            <AiRecentErrors errors={data.recentErrors} />
            <AiRecentFeedback feedback={data.recentFeedback} />
          </div>
        </div>
      )}
    </div>
  );
}
