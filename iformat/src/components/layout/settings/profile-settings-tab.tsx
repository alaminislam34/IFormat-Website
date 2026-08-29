"use client";

import React from "react";
import { User, Shield, Mail, Phone, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserSession } from "@/types/api";

interface ProfileSettingsTabProps {
  user: UserSession;
  name: string;
  setName: (name: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProfileSettingsTab({
  user,
  name,
  setName,
  phone,
  setPhone,
  isSaving,
  onSubmit,
}: ProfileSettingsTabProps) {
  const roleLabel =
    user.role === "admin" || user.role === "ADMIN"
      ? "Administrator"
      : user.role === "employer" || user.role === "EMPLOYER"
      ? "Employer"
      : "Candidate";

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Account Type Badge */}
      <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#0A54B1]" />
          <span className="text-xs font-bold text-slate-800">
            {roleLabel} Account
          </span>
        </div>
        {user.emailVerified && (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Full Name <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          />
        </div>
      </div>

      {/* Email Address (Readonly) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-medium cursor-not-allowed"
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Email address is linked to your account identity.
        </p>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Phone Number (Optional)
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isSaving}
          className="w-full h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving Changes...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Save Profile Details
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
