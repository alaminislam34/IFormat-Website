"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Loader2,
  Home,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { apiClient } from "@/lib/api/api-client";
import { toast } from "sonner";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  active: boolean;
  isExternalOrPublic?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/auth/logout").catch(() => {});
    } finally {
      logout();
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  const isEmployer = user?.role === "EMPLOYER" || user?.role === "employer";
  const isAdmin = user?.role === "ADMIN" || user?.role === "admin";
  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const navigationSections: NavSection[] = [
    {
      title: "Menu",
      items: [
        {
          label: "Overview",
          href: "/dashboard",
          icon: LayoutDashboard,
          active: pathname === "/dashboard",
        },
        {
          label: "Career Consultations",
          href: "/dashboard/bookings",
          icon: Calendar,
          active: pathname.startsWith("/dashboard/bookings"),
        },
        {
          label: "Membership & Plans",
          href: "/dashboard/billing",
          icon: CreditCard,
          active: pathname.startsWith("/dashboard/billing"),
        },
        {
          label: "Profile & Settings",
          href: "/dashboard/profile",
          icon: Settings,
          active: pathname.startsWith("/dashboard/profile"),
        },
      ],
    },
    ...(isAdmin
      ? [
          {
            title: "Administration",
            items: [
              {
                label: "Admin Command Center",
                href: "/admin",
                icon: Shield,
                active: pathname.startsWith("/admin"),
                isExternalOrPublic: true,
              },
            ],
          },
        ]
      : []),
  ];

  // Close sidebar on path change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#0A54B1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* ================= MOBILE SIDEBAR BACKDROP ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= DESKTOP & MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] flex items-center justify-center shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <span className="text-white font-black text-lg">iF</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  iFormat
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0A54B1]">
                  {isEmployer ? "Employer Hub" : "Candidate Hub"}
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navigationSections.map((section, sIdx) => (
              <div key={`nav-section-${sIdx}`} className="space-y-1.5">
                <h4 className="px-3 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.items.map((item, iIdx) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={`nav-item-${iIdx}`}
                        href={item.href}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.active
                            ? "bg-linear-to-r from-sky-50 to-blue-50 text-[#0A54B1] border border-sky-100 shadow-xs"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 ${
                              item.active ? "text-[#0A54B1]" : "text-slate-400"
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.isExternalOrPublic && (
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                        )}
                        {item.active && !item.isExternalOrPublic && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0A54B1]" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom User Card & Quick Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          {/* Public Website Link */}
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-[#0A54B1] hover:bg-white transition-colors border border-transparent hover:border-slate-200 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-slate-400" />
              <span>Back to Main Website</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {/* User Profile Info + Logout */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white bg-linear-to-r from-[#52CEDE] to-[#0A54B1] shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.name || "My Account"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-72">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                Dashboard
              </Link>
              {pathname !== "/dashboard" && (
                <>
                  <span>/</span>
                  <span className="text-slate-900 font-bold capitalize">
                    {pathname.split("/").filter(Boolean).pop()?.replace("-", " ")}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConsultModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white text-xs font-bold shadow-sm active:scale-95 cursor-pointer transition-all"
            >
              Book a Free Consult
            </button>
          </div>
        </header>

        {/* Render Page Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Book Consultation Modal */}
      {isConsultModalOpen && (
        <BookConsultationModal
          isOpen={isConsultModalOpen}
          onClose={() => setIsConsultModalOpen(false)}
        />
      )}
    </div>
  );
}
