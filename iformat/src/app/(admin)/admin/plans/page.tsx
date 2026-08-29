"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import {
  PlanDTO,
  PlanAudience,
  CreatePlanDTO,
} from "@/types/api";

import { AdminPlanCard } from "@/features/admin/components/plans/admin-plan-card";
import {
  AdminPlanEditorModal,
  PlanFormData,
} from "@/features/admin/components/plans/admin-plan-editor-modal";

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
      await membershipService.updatePlan(plan.id, {
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs h-9 px-4 rounded-xl cursor-pointer"
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
          {filteredPlans.map((plan) => (
            <AdminPlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleOpenEdit}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Plan Create / Edit Modal Dialog */}
      <AdminPlanEditorModal
        isOpen={isModalOpen}
        editingPlan={editingPlan}
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
