"use client";

import * as React from "react";
import { AiAnalyticsDTO } from "@/services/admin.service";
import { formatNumber, formatTokens } from "./ai-analytics-utils";

type Day = AiAnalyticsDTO["daily"][number];

const CHART_HEIGHT = 180;
const MAX_BAR_WIDTH = 24;

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Fills days with no AI calls so gaps show as gaps instead of being skipped. */
function fillMissingDays(daily: Day[], rangeDays: number): Day[] {
  const byDate = new Map(daily.map((d) => [d.date, d]));
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Array.from({ length: rangeDays }, (_, i) => {
    const date = new Date(today.getTime() - (rangeDays - 1 - i) * 86_400_000).toISOString().slice(0, 10);
    return byDate.get(date) ?? { date, calls: 0, errors: 0, tokens: 0 };
  });
}

export function AiDailyChart({ daily, rangeDays }: { daily: Day[]; rangeDays: number }) {
  const days = React.useMemo(() => fillMissingDays(daily, rangeDays), [daily, rangeDays]);
  const [active, setActive] = React.useState<number | null>(null);
  const peak = Math.max(1, ...days.map((d) => d.calls));
  const activeDay = active === null ? null : days[active];
  const labelEvery = Math.ceil(days.length / 7);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-sm font-bold text-slate-900">AI calls per day</h2>
          <p className="text-xs text-slate-500 mt-0.5">Last {rangeDays} days, UTC. Hover a column for details.</p>
        </div>
        <div className="text-right text-xs text-slate-400">Peak {formatNumber(peak)} calls</div>
      </div>

      <div className="relative">
        {activeDay && (
          <div
            role="status"
            className="pointer-events-none absolute z-10 -top-1 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs"
            style={{
              left: `${((active! + 0.5) / days.length) * 100}%`,
              transform: `translateX(${active! > days.length / 2 ? "-100%" : "0"}) translateY(-100%)`,
            }}
          >
            <div className="font-bold text-slate-900">{formatNumber(activeDay.calls)} calls</div>
            <div className="text-slate-500">{formatDay(activeDay.date)}</div>
            <div className="mt-1 flex items-center gap-3 text-slate-500">
              <span>{formatNumber(activeDay.errors)} failed</span>
              <span>{formatTokens(activeDay.tokens)} tokens</span>
            </div>
          </div>
        )}

        <div className="flex items-end border-b border-slate-200" style={{ height: CHART_HEIGHT }}>
          {days.map((day, i) => (
            <button
              key={day.date}
              type="button"
              aria-label={`${formatDay(day.date)}: ${day.calls} calls, ${day.errors} failed`}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="group flex-1 h-full flex items-end justify-center focus:outline-none cursor-default"
            >
              <span
                className="block w-full rounded-t bg-[#2a78d6] group-hover:bg-[#1f5fae] group-focus-visible:bg-[#1f5fae] transition-colors"
                style={{
                  maxWidth: MAX_BAR_WIDTH,
                  marginInline: 1,
                  height: `${(day.calls / peak) * 100}%`,
                  minHeight: day.calls ? 2 : 0,
                }}
              />
            </button>
          ))}
        </div>

        <div className="flex mt-2">
          {days.map((day, i) => (
            <span key={day.date} className="flex-1 text-center text-[10px] text-slate-400">
              {i % labelEvery === 0 ? formatDay(day.date) : ""}
            </span>
          ))}
        </div>
      </div>

      <details className="mt-4 text-xs">
        <summary className="cursor-pointer font-semibold text-slate-500 hover:text-slate-700">View as table</summary>
        <div className="mt-2 max-h-56 overflow-auto rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold text-right">Calls</th>
                <th className="px-3 py-2 font-semibold text-right">Failed</th>
                <th className="px-3 py-2 font-semibold text-right">Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...days].reverse().map((day) => (
                <tr key={day.date}>
                  <td className="px-3 py-1.5 text-slate-700">{formatDay(day.date)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-700">{formatNumber(day.calls)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-700">{formatNumber(day.errors)}</td>
                  <td className="px-3 py-1.5 text-right text-slate-700">{formatNumber(day.tokens)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
