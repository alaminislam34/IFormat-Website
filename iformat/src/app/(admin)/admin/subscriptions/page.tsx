"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Sparkles,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService, AdminUserItemDTO } from "@/services/admin.service";
import { membershipService } from "@/services/membership.service";
import { PlanDTO } from "@/types/api";
import { AdminPageHeader } from "@/features/admin/components/shared/admin-page-header";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFilterBar,
  Pagination,
  Skeleton,
} from "@/components/ui/table";

export default function AdminSubscriptionsPage() {
  const [users, setUsers] = useState<AdminUserItemDTO[]>([]);
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [overrideModalUser, setOverrideModalUser] = useState<AdminUserItemDTO | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [durationDays, setDurationDays] = useState<number>(365);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit: pageSize,
      };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "ALL") params.role = roleFilter;

      const [uRes, pRes] = await Promise.all([
        adminService.listUsers(params),
        membershipService.getPlans(),
      ]);

      if (uRes) {
        setUsers(Array.isArray(uRes) ? uRes : uRes.users || []);
        if (uRes.meta?.total !== undefined) {
          setTotalCount(uRes.meta.total);
        }
      }
      if (pRes) {
        setPlans(Array.isArray(pRes) ? pRes : (pRes as any).plans || []);
      }
    } catch (err: any) {
      console.warn("Could not load subscriptions:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, pageSize, roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

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

  const roleTabs = [
    { key: "ALL", label: "All Users" },
    { key: "EMPLOYER", label: "Employers" },
    { key: "CANDIDATE", label: "Candidates" },
  ];

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
      <AdminPageHeader
        title="Subscriptions Ledger & Comping"
        description="Monitor active user subscriptions and manually grant / override VIP access tiers without billing Stripe."
      />

      {/* Filter Bar */}
      <TableFilterBar
        tabs={roleTabs}
        activeTab={roleFilter}
        onTabChange={(tab) => {
          setRoleFilter(tab);
          setPage(1);
        }}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Search by user name or email..."
      />

      {/* Subscribers Table */}
      <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User / Account</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Plan</TableHead>
              <TableHead>Subscription Status</TableHead>
              <TableHead className="text-right">Manual Override</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              /* UI-Preserving Skeleton Loading Rows */
              Array.from({ length: 6 }).map((_, idx) => (
                <TableRow key={`sub-skeleton-${idx}`} className="hover:bg-transparent">
                  {/* User / Account */}
                  <TableCell>
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </TableCell>

                  {/* Role */}
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </TableCell>

                  {/* Assigned Plan */}
                  <TableCell>
                    <Skeleton className="h-6 w-32 rounded-lg" />
                  </TableCell>

                  {/* Subscription Status */}
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>

                  {/* Manual Override */}
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-36 rounded-xl" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              /* Empty State */
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="p-0 border-none">
                  <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-400 flex items-center justify-center shadow-xs">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight">No Users Found</h4>
                      <p className="text-xs text-slate-500 max-w-sm">
                        No users match your criteria. Try adjusting your search query or role filter.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => {
                const sub = u.subscription;
                const hasPaidSub = sub && sub.plan;

                return (
                  <TableRow key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell>
                      <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-slate-500 text-xs">{u.email}</p>
                    </TableCell>

                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                        {u.role?.toLowerCase()}
                      </span>
                    </TableCell>

                    <TableCell>
                      {hasPaidSub ? (
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {sub.plan?.name} (${((sub.plan?.priceInCents || 0) / 100).toFixed(0)}/mo)
                        </span>
                      ) : (
                        <span className="text-slate-500 text-xs">Free Tier</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize ${
                          sub?.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {(sub?.status || "INACTIVE").toLowerCase()}
                      </span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        onClick={() => {
                          setOverrideModalUser(u);
                          setSelectedPlanId(plans[0]?.id || "");
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 rounded-xl text-xs font-semibold bg-white border-slate-200 text-sky-600 hover:text-sky-700 hover:bg-sky-50 shadow-xs cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        <span>Grant / Comp Plan</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
            </TableBody>
          </Table>
      </div>

      {/* Pagination */}
      <Pagination
        card
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        loading={loading}
        onPageChange={(newPage) => setPage(newPage)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />

      {/* Manual Plan Grant Modal */}
      {overrideModalUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>Manual Plan Grant / Override</span>
              </div>
              <button
                onClick={() => setOverrideModalUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Granting a plan directly assigns active entitlements to{" "}
              <span className="font-semibold text-slate-900">{overrideModalUser.name}</span> (
              {overrideModalUser.email}) without charging a credit card.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Membership Tier
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full h-10 bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 font-medium focus:ring-sky-500 cursor-pointer"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) — {p.targetAudience}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Duration (Days)
                </label>
                <Input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="bg-slate-50 border-slate-200 text-slate-900 text-xs rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                onClick={() => setOverrideModalUser(null)}
                variant="outline"
                className="rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGrantPlan}
                disabled={actionLoading}
                className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
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
