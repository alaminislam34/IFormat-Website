import { ThumbsDown, ThumbsUp } from "lucide-react";
import { AiAnalyticsDTO } from "@/services/admin.service";
import { featureLabel, formatLatency, formatNumber, formatTokens, formatUsd } from "./ai-analytics-utils";

const cardClass = "bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden";
const thClass = "px-4 py-3 font-semibold";
const tdClass = "px-4 py-3 text-slate-700";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="px-6 pb-6 text-xs text-slate-400">{children}</p>;
}

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

export function AiFeatureTable({ features, showCost }: { features: AiAnalyticsDTO["features"]; showCost: boolean }) {
  const maxCalls = Math.max(1, ...features.map((f) => f.calls));

  return (
    <Card title="Usage by feature" description="Which AI tools are used most, what they cost and how well they perform.">
      {features.length === 0 ? (
        <Empty>No AI calls in this period yet.</Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 border-y border-slate-200/80">
              <tr>
                <th className={thClass}>Feature</th>
                <th className={`${thClass} min-w-40`}>Calls</th>
                <th className={`${thClass} text-right`}>Error rate</th>
                <th className={`${thClass} text-right`}>Tokens</th>
                {showCost && <th className={`${thClass} text-right`}>Est. cost</th>}
                <th className={`${thClass} text-right`}>Avg time</th>
                <th className={`${thClass} text-right`}>Rated helpful</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {features.map((f) => (
                <tr key={f.feature} className="hover:bg-slate-50/60">
                  <td className={`${tdClass} font-semibold text-slate-900`}>{featureLabel(f.feature)}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-2">
                      <span className="w-10 text-right font-semibold">{formatNumber(f.calls)}</span>
                      <span className="h-1.5 flex-1 rounded-full bg-slate-100">
                        <span
                          className="block h-full rounded-full bg-[#2a78d6]"
                          style={{ width: `${(f.calls / maxCalls) * 100}%` }}
                        />
                      </span>
                    </div>
                  </td>
                  <td className={`${tdClass} text-right ${f.errorRate >= 10 ? "font-bold text-rose-600" : ""}`}>
                    {f.errorRate}%{f.failed > 0 && <span className="text-slate-400"> ({f.failed})</span>}
                  </td>
                  <td className={`${tdClass} text-right`}>{formatTokens(f.tokens)}</td>
                  {showCost && <td className={`${tdClass} text-right`}>{formatUsd(f.estimatedCostUsd)}</td>}
                  <td className={`${tdClass} text-right`}>{formatLatency(f.avgLatencyMs)}</td>
                  <td className={`${tdClass} text-right`}>
                    {f.satisfaction === null ? (
                      <span className="text-slate-400">No ratings</span>
                    ) : (
                      <span className={f.satisfaction < 60 ? "font-bold text-rose-600" : ""}>
                        {f.satisfaction}% <span className="text-slate-400">({f.thumbsUp + f.thumbsDown})</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function AiPlanTable({ plans, showCost }: { plans: AiAnalyticsDTO["plans"]; showCost: boolean }) {
  return (
    <Card title="Usage by plan" description="Compare what free and paid members consume.">
      {plans.length === 0 ? (
        <Empty>No data yet.</Empty>
      ) : (
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-500 border-y border-slate-200/80">
            <tr>
              <th className={thClass}>Plan</th>
              <th className={`${thClass} text-right`}>Calls</th>
              <th className={`${thClass} text-right`}>Tokens</th>
              {showCost && <th className={`${thClass} text-right`}>Est. cost</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans.map((p) => (
              <tr key={p.planCode}>
                <td className={`${tdClass} font-semibold text-slate-900`}>{p.planCode}</td>
                <td className={`${tdClass} text-right`}>{formatNumber(p.calls)}</td>
                <td className={`${tdClass} text-right`}>{formatTokens(p.tokens)}</td>
                {showCost && <td className={`${tdClass} text-right`}>{formatUsd(p.estimatedCostUsd)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function AiTopUsersTable({ users, showCost }: { users: AiAnalyticsDTO["topUsers"]; showCost: boolean }) {
  return (
    <Card title="Heaviest users" description="Top 10 by token usage. Useful for spotting abuse or upgrade candidates.">
      {users.length === 0 ? (
        <Empty>No data yet.</Empty>
      ) : (
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 text-slate-500 border-y border-slate-200/80">
            <tr>
              <th className={thClass}>User</th>
              <th className={`${thClass} text-right`}>Calls</th>
              <th className={`${thClass} text-right`}>Tokens</th>
              {showCost && <th className={`${thClass} text-right`}>Est. cost</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.userId}>
                <td className={tdClass}>
                  <div className="font-semibold text-slate-900">{u.name}</div>
                  <div className="text-slate-400">{u.email ?? "-"}</div>
                </td>
                <td className={`${tdClass} text-right`}>{formatNumber(u.calls)}</td>
                <td className={`${tdClass} text-right`}>{formatTokens(u.tokens)}</td>
                {showCost && <td className={`${tdClass} text-right`}>{formatUsd(u.estimatedCostUsd)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}

export function AiRecentErrors({ errors }: { errors: AiAnalyticsDTO["recentErrors"] }) {
  return (
    <Card title="Recent failures" description="Latest failed or timed-out AI calls.">
      {errors.length === 0 ? (
        <Empty>No failures in this period.</Empty>
      ) : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {errors.map((e) => (
            <li key={e.id} className="px-6 py-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-900">{featureLabel(e.feature)}</span>
                <span className="text-slate-400">{when(e.createdAt)}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-slate-500">
                <span className="rounded px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 font-semibold">
                  {e.status === "TIMEOUT" ? "Timed out" : "Error"}
                </span>
                <span>{e.user?.email ?? "System"}</span>
                <span>· {formatLatency(e.latencyMs)}</span>
              </div>
              {e.errorMessage && <p className="mt-1 text-slate-500 break-words">{e.errorMessage}</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export function AiRecentFeedback({ feedback }: { feedback: AiAnalyticsDTO["recentFeedback"] }) {
  return (
    <Card title="Latest user feedback" description="Thumbs up/down and comments on AI results.">
      {feedback.length === 0 ? (
        <Empty>No feedback yet.</Empty>
      ) : (
        <ul className="divide-y divide-slate-100 border-t border-slate-100">
          {feedback.map((f) => (
            <li key={f.id} className="px-6 py-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-semibold text-slate-900">
                  {f.feedbackRating === "UP" ? (
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" aria-label="Helpful" />
                  ) : (
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-600" aria-label="Not helpful" />
                  )}
                  {featureLabel(f.feature)}
                </span>
                <span className="text-slate-400">{when(f.feedbackAt)}</span>
              </div>
              <div className="mt-0.5 text-slate-500">{f.user?.email ?? "Deleted user"}</div>
              {f.feedbackComment && <p className="mt-1 text-slate-700 break-words">&ldquo;{f.feedbackComment}&rdquo;</p>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
