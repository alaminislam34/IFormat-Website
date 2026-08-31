"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  CreditCard,
  Layers,
  Calendar,
  History,
  Settings,
  LogOut,
  Shield,
  ExternalLink,
  Loader2,
  Menu,
  X,
  Activity,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    let activeUser = user;
    let isAuthed = isAuthenticated;

    if (!isAuthed && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("iformat-auth-storage");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.state?.isAuthenticated && parsed?.state?.user) {
            activeUser = parsed.state.user;
            isAuthed = true;
          }
        }
      } catch {
        // ignore
      }
    }

    if (!isAuthed) {
      router.replace("/admin/login");
      return;
    }

    const roleUpper = activeUser?.role?.toUpperCase();
    if (roleUpper !== "ADMIN") {
      router.replace("/admin/login");
      return;
    }

    setAuthChecked(true);
  }, [isAuthenticated, isLoginPage, isMounted, router, user]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Verifying Admin Authorization...
          </p>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      group: "Users & Moderation",
      items: [
        { label: "User Directory", href: "/admin/users", icon: Users },
        { label: "Job Moderation", href: "/admin/jobs", icon: Briefcase },
        { label: "Company Badges", href: "/admin/companies", icon: Building2 },
      ],
    },
    {
      group: "Monetization",
      items: [
        { label: "Membership Plans", href: "/admin/plans", icon: Layers },
        { label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
      ],
    },
    {
      group: "Platform & Services",
      items: [
        { label: "Consultation Bookings", href: "/admin/bookings", icon: Calendar },
        { label: "Audit Activity Logs", href: "/admin/audit-logs", icon: History },
        { label: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden selection:bg-sky-500 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white tracking-tight">iFormat</span>
                <span className="ml-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Admin
                </span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
                  {group.group}
                </h4>
                {group.items.map((item, iIdx) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 font-extrabold"
                          : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Account & Sign Out */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-950/40 border border-slate-800/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                {user?.name?.[0] || "A"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{user?.name || "Administrator"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || "admin@iformat.com"}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 px-6 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Platform Core Online</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </header>

        {/* Page View Body */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
