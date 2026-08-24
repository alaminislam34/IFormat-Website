"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  Sparkles,
  CheckCircle2,
  Calendar,
  User,
  Loader2,
  X,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService, AdminUserItemDTO } from "@/services/admin.service";
import { membershipService } from "@/services/membership.service";
import { PlanDTO } from "@/types/api";

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<AdminUserItemDTO[]>([]);
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [overrideModalUser, setOverrideModalUser] = useState<AdminUserItemDTO | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [durationDays, setDurationDays] = useState<number>(365);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes] = await Promise.all([
        adminService.listUsers({ search: search.trim() || undefined }),
        membershipService.getPlans(),
      ]);
      if (uRes?.users) setUsers(uRes.users);
      if (pRes) setPlans(Array.isArray(pRes) ? pRes : (pRes as any).plans || []);
    } catch (err: any) {
      console.warn("Could not load subscriptions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGrantPlan = async () => {
    if (!overrideModalUser || !selectedPlanId) return;
    try {
      setActionLoading(true);
      await adminService.overrideSubscription(overrideModalUser.id, selectedPlanId, durationDays);
      setToastMessage(`Plan successfully comped/assigned to ${overrideModalUser.email}.`);
      setOverrideModalUser(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to assign plan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Subscriptions Ledger & Comping
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Monitor active user subscriptions and manually grant / override VIP access tiers without billing Stripe.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 flex items-center justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadData();
          }}
          className="relative w-full max-w-md"
        >
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 bg-slate-950 border-slate-800 text-white text-xs rounded-xl focus-visible:ring-sky-500"
          />
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">User / Account</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Plan</th>
                  <th className="p-4">Subscription Status</th>
                  <th className="p-4 text-right">Manual Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const sub = u.subscription;
                  const hasPaidSub = sub && sub.plan;

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{u.name}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300">
                          {u.role}
                        </span>
                      </td>

                      <td className="p-4">
                        {hasPaidSub ? (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {sub.plan?.name} (${((sub.plan?.priceInCents || 0) / 100).toFixed(0)}/mo)
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Free Tier</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            sub?.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {sub?.status || "INACTIVE"}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          onClick={() => {
                            setOverrideModalUser(u);
                            setSelectedPlanId(plans[0]?.id || "");
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 rounded-xl text-xs font-bold bg-slate-800 border-slate-700 text-sky-400 hover:text-white hover:bg-sky-600 hover:border-sky-500"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                          Grant / Comp Plan
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Plan Grant Modal */}
      {overrideModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>Manual Plan Grant / Override</span>
              </div>
              <button
                onClick={() => setOverrideModalUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Granting a plan directly assigns active entitlements to{" "}
              <span className="font-bold text-white">{overrideModalUser.name}</span> (
              {overrideModalUser.email}) without charging a credit card.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Select Membership Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full h-10 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 font-semibold focus:ring-sky-500"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — {p.targetAudience}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Duration (Days)
                </label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setOverrideModalUser(null)}
                variant="outline"
                className="rounded-xl text-xs font-bold bg-slate-800 border-slate-700 text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGrantPlan}
                disabled={actionLoading}
                className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm Plan Override"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
