"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlanDTO,
  PlanAudience,
  PlanBillingInterval,
  CreatePlanDTO,
} from "@/types/api";

export interface PlanFormData {
  name: string;
  code: string;
  description: string;
  priceInDollars: number;
  billingInterval: PlanBillingInterval;
  targetAudience: PlanAudience;
  maxActiveJobs: string;
  maxApplicationsPerMonth: string;
  aiScreeningEnabled: boolean;
  featuredJobPlacement: boolean;
  unmaskedApplicantProfiles: boolean;
  unlimitedCvTemplates: boolean;
  consultationDiscountPercent: number;
  isActive: boolean;
}

interface AdminPlanEditorModalProps {
  isOpen: boolean;
  editingPlan: PlanDTO | null;
  formData: PlanFormData;
  setFormData: React.Dispatch<React.SetStateAction<PlanFormData>>;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminPlanEditorModal({
  isOpen,
  editingPlan,
  formData,
  setFormData,
  isSubmitting,
  onClose,
  onSubmit,
}: AdminPlanEditorModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5">
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
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
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
  );
}
