"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface SecuritySettingsTabProps {
  currentPassword: string;
  setCurrentPassword: (p: string) => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  isChanging: boolean;
  onSubmit: (e: React.FormEvent) => void;
  errors?: PasswordErrors;
  serverError?: string;
}

export function SecuritySettingsTab({
  currentPassword,
  setCurrentPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isChanging,
  onSubmit,
  errors,
  serverError,
}: SecuritySettingsTabProps) {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Server-side error banner */}
      {serverError && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold" role="alert">
          <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {serverError}
        </div>
      )}

      {/* Current Password */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Current Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showCurrentPass ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            aria-invalid={!!errors?.currentPassword}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
              errors?.currentPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowCurrentPass(!showCurrentPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors?.currentPassword && (
          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
            <span>⚠</span> {errors.currentPassword}
          </p>
        )}
      </div>

      {/* New Password */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          New Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showNewPass ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            aria-invalid={!!errors?.newPassword}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
              errors?.newPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors?.newPassword ? (
          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
            <span>⚠</span> {errors.newPassword}
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-slate-400">Use at least 8 characters with a mix of letters and numbers.</p>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Confirm New Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            aria-invalid={!!errors?.confirmPassword}
            className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all ${
              errors?.confirmPassword ? "border-rose-400 bg-rose-50/30" : "border-slate-200"
            }`}
          />
        </div>
        {errors?.confirmPassword && (
          <p className="mt-1 text-[11px] font-semibold text-rose-600 flex items-center gap-1" role="alert">
            <span>⚠</span> {errors.confirmPassword}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isChanging}
          className="w-full h-11 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
        >
          {isChanging ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" /> Updating Password...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Update Password
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
