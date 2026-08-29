"use client";

import { useEffect, useState } from "react";
import {
  Layers,
  Sparkles,
  Check,
  Shield,
  Briefcase,
  Bot,
  Eye,
  Loader2,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  RefreshCw,
  Plus,
  Edit3,
  X,
  ToggleLeft,
  ToggleRight,
  Sliders,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import {
  PlanDTO,
  PlanAudience,
  PlanBillingInterval,
  CreatePlanDTO,
  UpdatePlanDTO,
} from "@/types/api";

interface PlanFormData {
  name: string;
  code: string;
  description: string;
  priceInDollars: number;
  billingInterval: PlanBillingInterval;
  targetAudience: PlanAudience;
  maxActiveJobs: string; // string for flexible input
  maxApplicationsPerMonth: string;
  aiScreeningEnabled: boolean;
  featuredJobPlacement: boolean;
  unmaskedApplicantProfiles: boolean;
  unlimitedCvTemplates: boolean;
  consultationDiscountPercent: number;
  isActive: boolean;
}

const DEFAULT_FORM: PlanFormData = {
  name: "",
  code: "",
  description: "",
  priceInDollars: 0,
  billingInterval: "MONTHLY",
  targetAudience: "EMPLOYER",
  maxActiveJobs: "5",
  maxApplicationsPerMonth: "50",
  aiScreeningEnabled: true,
  featuredJobPlacement: false,
  unmaskedApplicantProfiles: true,
  unlimitedCvTemplates: true,
  consultationDiscountPercent: 0,
  isActive: true,
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audienceTab, setAudienceTab] = useState<"EMPLOYER" | "CANDIDATE" | "ALL">("EMPLOYER");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanDTO | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await membershipService.getPlans();
      if (res) setPlans(Array.isArray(res) ? res : (res as any).plans || []);
    } catch (err: any) {
      const msg = err?.message || "Could not load subscription plans.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      ...DEFAULT_FORM,
      targetAudience: audienceTab === "ALL" ? "EMPLOYER" : audienceTab,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: PlanDTO) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      code: plan.code,
      description: plan.description || "",
      priceInDollars: plan.priceInCents / 100,
      billingInterval: plan.billingInterval,
      targetAudience: plan.targetAudience,
      maxActiveJobs: plan.maxActiveJobs !== null && plan.maxActiveJobs !== undefined ? String(plan.maxActiveJobs) : "",
      maxApplicationsPerMonth:
        plan.maxApplicationsPerMonth !== null && plan.maxApplicationsPerMonth !== undefined
          ? String(plan.maxApplicationsPerMonth)
          : "",
      aiScreeningEnabled: plan.aiScreeningEnabled,
      featuredJobPlacement: plan.featuredJobPlacement,
      unmaskedApplicantProfiles: plan.unmaskedApplicantProfiles,
      unlimitedCvTemplates: plan.unlimitedCvTemplates,
      consultationDiscountPercent: plan.consultationDiscountPercent || 0,
      isActive: plan.isActive,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (plan: PlanDTO) => {
    try {
      const updated = await membershipService.updatePlan(plan.id, {
        isActive: !plan.isActive,
      });
      toast.success(`Plan "${plan.name}" is now ${!plan.isActive ? "active" : "inactive"}`);
      setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, isActive: !p.isActive } : p)));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update plan status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Plan code is required");
      return;
    }

    const formattedCode = formData.code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const payload: CreatePlanDTO = {
      name: formData.name.trim(),
      code: formattedCode,
      description: formData.description.trim() || undefined,
      priceInCents: Math.round(Number(formData.priceInDollars) * 100),
      billingInterval: formData.billingInterval,
      targetAudience: formData.targetAudience,
      maxActiveJobs: formData.maxActiveJobs.trim() !== "" ? Number(formData.maxActiveJobs) : null,
      maxApplicationsPerMonth:
        formData.maxApplicationsPerMonth.trim() !== "" ? Number(formData.maxApplicationsPerMonth) : null,
      aiScreeningEnabled: formData.aiScreeningEnabled,
      featuredJobPlacement: formData.featuredJobPlacement,
      unmaskedApplicantProfiles: formData.unmaskedApplicantProfiles,
      unlimitedCvTemplates: formData.unlimitedCvTemplates,
      consultationDiscountPercent: Number(formData.consultationDiscountPercent) || 0,
    };

    try {
      setIsSubmitting(true);
      if (editingPlan) {
        await membershipService.updatePlan(editingPlan.id, {
          ...payload,
          isActive: formData.isActive,
        });
        toast.success(`Plan "${formData.name}" updated successfully!`);
      } else {
        await membershipService.createPlan(payload);
        toast.success(`Plan "${formData.name}" created successfully!`);
      }
      setIsModalOpen(false);
      await loadPlans();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlans = plans.filter((p) => {
    if (audienceTab === "ALL") return true;
    return p.targetAudience === audienceTab || p.targetAudience === "BOTH";
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Membership Plans & Entitlements
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure subscription tiers, feature quotas, active job caps, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Audience Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
            <button
              onClick={() => setAudienceTab("EMPLOYER")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                audienceTab === "EMPLOYER"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Employer Plans
            </button>
            <button
              onClick={() => setAudienceTab("CANDIDATE")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                audienceTab === "CANDIDATE"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Candidate Plans
            </button>
            <button
              onClick={() => setAudienceTab("ALL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                audienceTab === "ALL"
                  ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
          </div>

          {/* Create Plan Button */}
          <Button
            onClick={handleOpenCreate}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl h-9 shadow-lg shadow-sky-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Plan
          </Button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      {error ? (
        <div className="bg-slate-900/90 border border-rose-800/80 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Failed to load membership plans</h3>
          <p className="text-xs text-rose-300/80 leading-relaxed">{error}</p>
          <Button
            onClick={loadPlans}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4 rounded-xl"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry Fetch
          </Button>
        </div>
      ) : loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 font-medium">
          No plans found for {audienceTab}. Click &quot;Create Plan&quot; to add one.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlans.map((plan) => {
            const isFree = plan.priceInCents === 0;

            return (
              <div
                key={plan.id}
                className={`bg-slate-900/90 border rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all ${
                  plan.isActive
                    ? "border-slate-800/80 hover:border-slate-700"
                    : "border-rose-950/60 opacity-60 bg-slate-950/40"
                }`}
              >
                <div>
                  {/* Top Bar with Badges & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-800 text-sky-400 border border-slate-700">
                      {plan.code}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        {plan.billingInterval}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          plan.isActive
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}
                      >
                        {plan.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed min-h-[32px]">
                    {plan.description || "Platform access tier"}
                  </p>

                  <div className="my-5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">
                        {isFree ? "Free" : `$${(plan.priceInCents / 100).toFixed(0)}`}
                      </span>
                      {!isFree && (
                        <span className="text-xs text-slate-400 font-medium">
                          /{plan.billingInterval === "YEARLY" ? "yr" : "mo"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Entitlements Checklist */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/80 text-xs">
                    {plan.maxActiveJobs !== null && plan.maxActiveJobs !== undefined && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Briefcase className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span>
                          {plan.maxActiveJobs === 0
                            ? "No job postings"
                            : `${plan.maxActiveJobs} Active Job Limit`}
                        </span>
                      </div>
                    )}

                    {plan.maxApplicationsPerMonth !== null && plan.maxApplicationsPerMonth !== undefined && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          {plan.maxApplicationsPerMonth === 999999
                            ? "Unlimited Applications"
                            : `${plan.maxApplicationsPerMonth} Apps / Month`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-slate-300">
                      <Bot
                        className={`w-3.5 h-3.5 ${
                          plan.aiScreeningEnabled ? "text-emerald-400" : "text-slate-600"
                        }`}
                      />
                      <span className={plan.aiScreeningEnabled ? "font-semibold text-white" : "text-slate-500"}>
                        AI Screening: {plan.aiScreeningEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-300">
                      <Eye
                        className={`w-3.5 h-3.5 ${
                          plan.unmaskedApplicantProfiles ? "text-emerald-400" : "text-slate-600"
                        }`}
                      />
                      <span className={plan.unmaskedApplicantProfiles ? "font-semibold text-white" : "text-slate-500"}>
                        Contact Masking: {plan.unmaskedApplicantProfiles ? "Unmasked" : "Masked"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                  <Button
                    onClick={() => handleOpenEdit(plan)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold h-8 rounded-xl cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5 text-sky-400" /> Edit Plan
                  </Button>
                  <Button
                    onClick={() => handleToggleActive(plan)}
                    variant="ghost"
                    size="sm"
                    className={`h-8 px-2.5 rounded-xl text-xs font-medium cursor-pointer ${
                      plan.isActive
                        ? "text-rose-400 hover:bg-rose-950/40 hover:text-rose-300"
                        : "text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                    }`}
                    title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
                  >
                    {plan.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Plan Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-0 duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Membership Plan"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingPlan ? "Update tier details and quotas." : "Configure a new tier for candidates or employers."}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Plan Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pro Recruiter"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Code Identifier <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. EMPLOYER_PRO"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of tier value and benefits..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500 resize-none"
                />
              </div>

              {/* Audience, Interval, Price */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) =>
                      setFormData({ ...formData, targetAudience: e.target.value as PlanAudience })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="EMPLOYER">Employer</option>
                    <option value="CANDIDATE">Candidate</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Billing Interval</label>
                  <select
                    value={formData.billingInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, billingInterval: e.target.value as PlanBillingInterval })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="YEARLY">Yearly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Price ($ USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.priceInDollars}
                    onChange={(e) => setFormData({ ...formData, priceInDollars: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Quotas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Active Jobs (Employer)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5 (leave blank for unlimited)"
                    value={formData.maxActiveJobs}
                    onChange={(e) => setFormData({ ...formData, maxActiveJobs: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Max Applications / Month (Candidate)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50"
                    value={formData.maxApplicationsPerMonth}
                    onChange={(e) => setFormData({ ...formData, maxApplicationsPerMonth: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Features & Entitlements</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.aiScreeningEnabled}
                      onChange={(e) => setFormData({ ...formData, aiScreeningEnabled: e.target.checked })}
                      className="w-4 h-4 rounded-md text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200 font-medium">AI Candidate Screening</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.unmaskedApplicantProfiles}
                      onChange={(e) =>
                        setFormData({ ...formData, unmaskedApplicantProfiles: e.target.checked })
                      }
                      className="w-4 h-4 rounded-md text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200 font-medium">Unmasked Profiles</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.featuredJobPlacement}
                      onChange={(e) => setFormData({ ...formData, featuredJobPlacement: e.target.checked })}
                      className="w-4 h-4 rounded-md text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200 font-medium">Featured Placement</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:bg-slate-950 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.unlimitedCvTemplates}
                      onChange={(e) => setFormData({ ...formData, unlimitedCvTemplates: e.target.checked })}
                      className="w-4 h-4 rounded-md text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs text-slate-200 font-medium">Unlimited CV Templates</span>
                  </label>
                </div>
              </div>

              {/* Status Toggle (only on edit) */}
              {editingPlan && (
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Plan Status</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 rounded-md text-sky-500 bg-slate-900 border-slate-700"
                    />
                    <span className="text-xs font-bold text-white">
                      {formData.isActive ? "Active (Listed in Catalog)" : "Inactive (Hidden)"}
                    </span>
                  </label>
                </div>
              )}

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 h-9 rounded-xl shadow-lg shadow-sky-600/20 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Saving...
                    </>
                  ) : editingPlan ? (
                    "Save Changes"
                  ) : (
                    "Create Plan"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
