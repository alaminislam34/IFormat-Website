"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SecuritySettingsTabProps {
  currentPassword: string;
  setCurrentPassword: (p: string) => void;
  newPassword: string;
  setNewPassword: (p: string) => void;
  confirmPassword: string;
  setConfirmPassword: (p: string) => void;
  isChanging: boolean;
  onSubmit: (e: React.FormEvent) => void;
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
}: SecuritySettingsTabProps) {
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Current Password */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Current Password <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showCurrentPass ? "text" : "password"}
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPass(!showCurrentPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
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
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNewPass(!showNewPass)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
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
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
          />
        </div>
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
