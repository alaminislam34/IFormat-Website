"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  Shield,
  CreditCard,
  LogOut,
  ChevronDown,
  Sparkles,
  Briefcase,
  Layers,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/api-client";

interface UserMenuProps {
  variant?: "dark" | "light";
}

export function UserMenu({ variant = "light" }: UserMenuProps) {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout").catch(() => {});
    } finally {
      logout();
      setIsOpen(false);
      toast.success("Logged out successfully");
      router.push("/");
      router.refresh();
    }
  };

  if (!isAuthenticated || !user) {
    const isDark = variant === "dark";
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            isDark
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          Sign In
        </Link>
        <Link
          href="/signup"
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
            isDark
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : "bg-brand-gradient text-white hover:opacity-95 shadow-blue-500/15"
          }`}
        >
          Get Started
        </Link>
      </div>
    );
  }

  const role = user.role?.toUpperCase() || "CANDIDATE";
  const isAdmin = role === "ADMIN";
  const isEmployer = role === "EMPLOYER";
  const isCandidate = role === "CANDIDATE";

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const isDark = variant === "dark";

  const roleLabel = isAdmin ? "Admin" : isEmployer ? "Employer" : "Candidate";
  const fullRoleLabel = isAdmin
    ? "Administrator Account"
    : isEmployer
    ? "Employer Account"
    : "Candidate Account";

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
          isDark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:shadow-sm"
        }`}
      >
        {/* Signature Brand Avatar */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] shadow-sm">
          {initial}
        </div>

        {/* User Info */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-bold leading-tight truncate max-w-30">
            {user.name || "My Account"}
          </span>
          <span
            className={`text-[10px] font-semibold tracking-wide ${
              isDark ? "text-white/80" : "text-[#0A54B1]"
            }`}
          >
            {roleLabel}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2.5 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header Card */}
          <div className="p-3 bg-slate-50 rounded-xl mb-1.5 border border-slate-100">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white bg-linear-to-r from-[#52CEDE] to-[#0A54B1] shadow-xs">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>

            {/* Clean Role Badge */}
            <div className="px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-100 text-[#0A54B1] text-[11px] font-bold flex items-center justify-between">
              <span>{fullRoleLabel}</span>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-600">Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-0.5 text-xs font-semibold text-slate-700">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#0A54B1] hover:bg-sky-50 transition-colors font-bold"
              >
                <Shield className="w-4 h-4 text-[#0A54B1]" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            {isEmployer && (
              <>
                <Link
                  href="/company-details"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
                >
                  <Building2 className="w-4 h-4 text-[#0A54B1]" />
                  <span>Company Details</span>
                </Link>
                <Link
                  href="/job-portal"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-[#0A54B1]" />
                  <span>Manage Jobs</span>
                </Link>
              </>
            )}

            {isCandidate && (
              <Link
                href="/job-assistant"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
              >
                <Briefcase className="w-4 h-4 text-[#0A54B1]" />
                <span>AI Job Assistant & CV</span>
              </Link>
            )}

            <Link
              href="/job-portal"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>Job Portal</span>
            </Link>

            <Link
              href="/dashboard/billing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#0A54B1]" />
              <span>Membership & Plans</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="pt-1.5 mt-1.5 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
