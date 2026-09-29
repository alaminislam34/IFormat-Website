"use client";

import React, { useState } from "react";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PlanDTO,
  PlanAudience,
  PlanBillingInterval,
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
  maxAiGenerations: string;
  aiScreeningEnabled: boolean;
  featuredJobPlacement: boolean;
  unmaskedApplicantProfiles: boolean;
  unlimitedCvTemplates: boolean;
  isActive: boolean;
  customFeaturesList: string[];
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
  const [newFeatureText, setNewFeatureText] = useState("");

  if (!isOpen) return null;

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData({
      ...formData,
      customFeaturesList: [newFeatureText.trim(), ...(formData.customFeaturesList || [])],
    });
    setNewFeatureText("");
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setFormData({
      ...formData,
      customFeaturesList: (formData.customFeaturesList || []).filter(
        (_, idx) => idx !== indexToRemove
      ),
    });
  };

  const handleUpdateFeature = (index: number, val: string) => {
    const updated = [...(formData.customFeaturesList || [])];
    updated[index] = val;
    setFormData({
      ...formData,
      customFeaturesList: updated,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header: Fixed at top (not scrollable) */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {editingPlan ? `Edit Plan: ${editingPlan.name}` : "Create New Membership Plan"}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {editingPlan ? "Update tier details, features, and quotas." : "Configure a new tier for candidates or employers."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container with scrollable content and fixed footer */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 scrollbar-thin">
            {editingPlan?.code === "FREE_TIER" && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-xs text-amber-900 flex items-start gap-3">
                <span className="text-lg leading-none">⚙️</span>
                <div>
                  <p className="font-semibold text-amber-950">Default Free Plan Quotas & Entitlements</p>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Limits and feature toggles saved here directly govern what all unpaid/free candidates and employers are allowed to do across the platform.
                  </p>
                </div>
              </div>
            )}
          {/* Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Plan Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Pro Recruiter"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Code Identifier <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={!!editingPlan}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. EMPLOYER_PRO"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of tier value and benefits..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) =>
                  setFormData({ ...formData, targetAudience: e.target.value as PlanAudience })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-sky-500"
              >
                <option value="EMPLOYER">Employer</option>
                <option value="CANDIDATE">Candidate</option>
                <option value="BOTH">Both</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Billing Interval</label>
                {editingPlan && (
                  <span className="text-[9px] font-medium text-amber-600">Locked</span>
                )}
              </div>
              <select
                disabled={!!editingPlan}
                value={formData.billingInterval}
                onChange={(e) =>
                  setFormData({ ...formData, billingInterval: e.target.value as PlanBillingInterval })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Price ($ USD)</label>
                {editingPlan && (
                  <span className="text-[9px] font-medium text-amber-600">
                    {editingPlan.code?.toUpperCase().includes("ENTERPRISE") ? "Custom Quoted" : "Stripe Managed"}
                  </span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="1"
                disabled={!!editingPlan}
                value={formData.priceInDollars}
                onChange={(e) => setFormData({ ...formData, priceInDollars: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Quotas & Limitations */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700">Limits & Quotas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Active Jobs (Employer)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5 (blank for unltd)"
                  value={formData.maxActiveJobs}
                  onChange={(e) => setFormData({ ...formData, maxActiveJobs: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max Apps / Month (Candidate)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50 (blank for unltd)"
                  value={formData.maxApplicationsPerMonth}
                  onChange={(e) => setFormData({ ...formData, maxApplicationsPerMonth: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Max AI Gen / Month
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5 (blank for unltd)"
                  value={formData.maxAiGenerations}
                  onChange={(e) => setFormData({ ...formData, maxAiGenerations: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Subscription Bullet Features List */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-700">Display Features (Bullet Points)</h4>
                <p className="text-[11px] text-slate-500">Edit the subscription features displayed on pricing cards.</p>
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {(formData.customFeaturesList || []).length} features
              </span>
            </div>

            {/* Feature Add Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Dedicated consultant, 1:1 Brand Strategy..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
              />
              <Button
                type="button"
                onClick={handleAddFeature}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 h-9 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </Button>
            </div>

            {/* Feature Items */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(formData.customFeaturesList || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl">
                  No custom feature bullets added yet. Type above and click Add.
                </p>
              ) : (
                formData.customFeaturesList.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-xs text-slate-400 font-mono w-4 shrink-0">{idx + 1}.</span>
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove feature"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-700">Capabilities & Permissions</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.aiScreeningEnabled}
                  onChange={(e) => setFormData({ ...formData, aiScreeningEnabled: e.target.checked })}
                  className="w-4 h-4 rounded-md text-sky-600 bg-white border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">AI Candidate Screening</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.unmaskedApplicantProfiles}
                  onChange={(e) =>
                    setFormData({ ...formData, unmaskedApplicantProfiles: e.target.checked })
                  }
                  className="w-4 h-4 rounded-md text-sky-600 bg-white border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">Unmasked Profiles</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.featuredJobPlacement}
                  onChange={(e) => setFormData({ ...formData, featuredJobPlacement: e.target.checked })}
                  className="w-4 h-4 rounded-md text-sky-600 bg-white border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">Featured Placement</span>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.unlimitedCvTemplates}
                  onChange={(e) => setFormData({ ...formData, unlimitedCvTemplates: e.target.checked })}
                  className="w-4 h-4 rounded-md text-sky-600 bg-white border-slate-300"
                />
                <span className="text-xs text-slate-700 font-medium">Unlimited CV Templates</span>
              </label>
            </div>
          </div>

          {/* Status Toggle (only on edit) */}
          {editingPlan && (
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Plan Status</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded-md text-sky-600 bg-white border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-800">
                  {formData.isActive ? "Active (Listed in Catalog)" : "Inactive (Hidden)"}
                </span>
              </label>
            </div>
          )}
          </div>

          {/* Fixed Footer: Always visible, never scrolls away */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0 z-10">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-5 h-9 rounded-xl shadow-sm shadow-sky-600/20 cursor-pointer"
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
