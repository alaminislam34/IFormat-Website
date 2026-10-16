import { Activity, Clock, Coins, ThumbsUp, Zap } from "lucide-react";
import { AiAnalyticsDTO } from "@/services/admin.service";
import { formatLatency, formatNumber, formatTokens, formatUsd } from "./ai-analytics-utils";

export function AiKpiGrid({ data }: { data: AiAnalyticsDTO }) {
  const { summary } = data;
  const rated = summary.thumbsUp + summary.thumbsDown;
  const satisfaction = rated ? Math.round((summary.thumbsUp / rated) * 100) : null;

  const cards = [
    {
      title: "AI Calls",
      value: formatNumber(summary.totalCalls),
      subtext: `${formatNumber(summary.failedCalls)} failed · ${summary.successRate}% success`,
      icon: Activity,
      iconBg: "bg-sky-50 text-sky-600 border border-sky-100",
    },
    {
      title: "Tokens Used",
      value: formatTokens(summary.totalTokens),
      subtext:
        summary.estimatedCostUsd === null
          ? "Set AI_COST_PER_1M_TOKENS_USD to see cost"
          : `≈ ${formatUsd(summary.estimatedCostUsd)} estimated cost`,
      icon: Coins,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-100",
    },
    {
      title: "Avg Response Time",
      value: formatLatency(summary.avgLatencyMs),
      subtext: `95th percentile ${formatLatency(summary.p95LatencyMs)}`,
      icon: Clock,
      iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100",
    },
    {
      title: "User Satisfaction",
      value: satisfaction === null ? "-" : `${satisfaction}%`,
      subtext: rated
        ? `${formatNumber(summary.thumbsUp)} 👍 · ${formatNumber(summary.thumbsDown)} 👎`
        : "No ratings yet",
      icon: satisfaction === null ? Zap : ThumbsUp,
      iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-500">{card.title}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</div>
              <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
