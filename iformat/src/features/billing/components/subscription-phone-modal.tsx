"use client";

import React, { useState, useEffect } from "react";
import { Phone, Sparkles, X, Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/use-auth-store";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

interface SubscriptionPlanInfo {
  id?: string;
  code?: string;
  name: string;
  priceInCents?: number;
  currency?: string;
  billingInterval?: string;
}

interface SubscriptionPhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlanInfo | null;
  onConfirm: (phone: string) => Promise<void>;
  loading?: boolean;
}

export function SubscriptionPhoneModal({
  isOpen,
  onClose,
  plan,
  onConfirm,
  loading: externalLoading = false,
}: SubscriptionPhoneModalProps) {
  const { user, updateUser } = useAuthStore();
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhone(user?.phone || "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, user?.phone]);

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = phone.trim();

    // Validation
    if (!trimmed) {
      setError("Please enter your contact phone number to continue.");
      return;
    }

    // Basic length & character check (at least 6 digits/characters, standard international phone format)
    const cleanedDigits = trimmed.replace(/\D/g, "");
    if (cleanedDigits.length < 6) {
      setError("Please enter a valid phone number with country/area code.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Persist to user profile if changed or not yet set
      if (trimmed !== user?.phone) {
        try {
          await userService.updateProfile({ phone: trimmed });
          updateUser({ phone: trimmed });
        } catch (err: any) {
          console.warn("Could not save phone to profile:", err?.message);
        }
      }

      await onConfirm(trimmed);
    } catch (err: any) {
      setError(err?.message || "Failed to initiate subscription checkout.");
      setIsSubmitting(false);
    }
  };

  const formattedPrice =
    plan.priceInCents !== undefined
      ? `$${(plan.priceInCents / 100).toFixed(0)}/${(
          plan.billingInterval || "mo"
        ).toLowerCase()}`
      : null;

  const isLoading = isSubmitting || externalLoading;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0A54B1] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-[#0A54B1]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Contact Number Required
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Confirm your phone for subscription activation
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form id="sub-phone-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4.5">
          {/* Plan Summary Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-sky-100 text-[#0A54B1] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Selected Membership
                </span>
                <span className="text-xs font-bold text-slate-900">{plan.name}</span>
              </div>
            </div>
            {formattedPrice && (
              <span className="px-2.5 py-1 rounded-xl bg-sky-600 text-white text-xs font-extrabold shadow-2xs">
                {formattedPrice}
              </span>
            )}
          </div>

          {/* Explanation */}
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            To ensure priority delivery of your subscription benefits, dedicated onboarding, and account support, please provide your active contact phone number.
          </p>

          {/* Phone Input Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                <Phone className="w-4 h-4 text-sky-600" />
              </span>
              <input
                type="tel"
                required
                autoFocus
                disabled={isLoading}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="+1 (555) 123-4567 or +971 50 123 4567"
                className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                  error
                    ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
                    : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                }`}
              />
            </div>
            {error ? (
              <p className="text-[11px] font-semibold text-rose-500 mt-1">{error}</p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Include country code (e.g. +1, +44, +971).
              </p>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 flex items-start gap-2.5 text-[11px] text-sky-900">
            <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              Your phone number is kept confidential and utilized strictly for subscription services, account notifications, and direct consulting.
            </span>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0 bg-slate-50/50">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="sub-phone-form"
            disabled={isLoading}
            className="bg-[#0A54B1] hover:bg-[#08428C] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer h-10 px-5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                Preparing Checkout...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Continue to Checkout
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
