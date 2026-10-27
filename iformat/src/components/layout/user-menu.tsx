"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Shield,
  CreditCard,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Settings,
  Calendar,
  Users,
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
      <div className="flex items-center">
        <Link
          href="/login"
          className={`px-5 h-10 rounded-xl inline-flex items-center justify-center text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
            isDark
              ? "bg-white text-[#0A54B1] hover:bg-slate-100 shadow-slate-900/10"
              : "bg-[#0A54B1] text-white hover:bg-[#08428c] shadow-[#0A54B1]/20"
          }`}
        >
          Sign In
        </Link>
      </div>
    );
  }

  const role = user.role?.toUpperCase() || "CANDIDATE";
  const isAdmin = role === "ADMIN";
  const isEmployer = role === "EMPLOYER";

  // Admins get admin pages only; candidate/employer pages don't apply to them
  const menuLinks = isAdmin
    ? [
        { href: "/admin", label: "Admin Command Center", icon: Shield },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/bookings", label: "Consultation Bookings", icon: Calendar },
        { href: "/admin/plans", label: "Plans & Subscriptions", icon: CreditCard },
        { href: "/admin/settings", label: "Admin Settings", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "My Dashboard", icon: LayoutDashboard },
        ...(isEmployer
          ? [{ href: "/company-details", label: "Company Details", icon: Building2 }]
          : [{ href: "/dashboard/bookings", label: "Career Consultations", icon: Calendar }]),
        { href: "/dashboard/billing", label: "Membership & Plans", icon: CreditCard },
        { href: "/dashboard/profile", label: "Profile & Settings", icon: Settings },
      ];

  const initial = user.name ? user.name.charAt(0).toUpperCase() : "U";
  const isDark = variant === "dark";

  const roleLabel = isAdmin ? "Admin" : isEmployer ? "Employer" : "Candidate";
  const fullRoleLabel = isAdmin
    ? "Administrator Account"
    : isEmployer
    ? "Employer Account"
    : "Candidate Account";

  return (
    <div className="flex items-center gap-2">
      {/* Avatar + dropdown wrapper */}
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

           
          </div>

          {/* Navigation Links (Essential Account Options Only) */}
          <div className="space-y-0.5 text-xs font-semibold text-slate-700">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 hover:text-[#0A54B1] transition-colors"
              >
                <item.icon className="w-4 h-4 text-[#0A54B1]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Logout */}
          <div className="pt-1.5 mt-1.5 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
