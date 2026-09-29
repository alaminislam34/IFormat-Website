"use client";

import React, { useState, useEffect } from "react";
import { Phone, Sparkles, X, Loader2, ShieldCheck, CheckCircle2, User, Mail, CalendarClock } from "lucide-react";
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
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPhone(user?.phone || "");
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, user?.name, user?.email, user?.phone]);

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    // Validation
    if (!trimmedName) {
      setError("Please provide your full name for membership registration.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please enter a valid email address for billing and communications.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your contact phone number to continue.");
      return;
    }

    const cleanedDigits = trimmedPhone.replace(/\D/g, "");
    if (cleanedDigits.length < 6) {
      setError("Please enter a valid phone number with country/area code.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // Persist profile updates if changed
      if (trimmedPhone !== user?.phone || (trimmedName && trimmedName !== user?.name)) {
        try {
          await userService.updateProfile({ name: trimmedName, phone: trimmedPhone });
          updateUser({ name: trimmedName, phone: trimmedPhone });
        } catch (err: any) {
          console.warn("Could not save updated profile:", err?.message);
        }
      }

      await onConfirm(trimmedPhone);
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
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Fixed Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0A54B1] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#0A54B1]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Membership Contact Confirmation
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Verify your details for membership activation & dedicated onboarding
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
        <form id="sub-phone-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
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

          {/* 6-Month Commitment Banner */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5 text-amber-900">
            <CalendarClock className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-amber-900">Membership Duration: Min. 6 Months Commitment</p>
              <p className="text-[11px] text-amber-700 leading-tight mt-0.5">
                All iFormat branding plans include an initial 6-month term to deliver proven, executive personal brand acceleration.
              </p>
            </div>
          </div>

          {/* Contact Details Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-600" />
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                disabled={isLoading}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Your Full Name"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-sky-600" />
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                disabled={isLoading || Boolean(user?.email)}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@example.com"
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Contact Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              Contact Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
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
                placeholder="+1 (555) 123-4567 or +44 20 7946 0912"
                className={`w-full h-10 px-3 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
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
              Your information is secure and used strictly for onboarding, direct advisor coordination, and subscription management.
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
