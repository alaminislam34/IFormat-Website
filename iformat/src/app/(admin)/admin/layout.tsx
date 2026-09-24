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
  ExternalLink,
  Loader2,
  Menu,
  X,
  ShoppingBag,
  MessageSquare,
  Film,
} from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { BrandLogo } from "@/components/ui/brand-logo";

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">
            Verifying admin authorization...
          </p>
        </div>
      </div>
    );
  }

  const getActivePageName = (path: string) => {
    if (path === "/admin") return "Dashboard";
    if (path.startsWith("/admin/users")) return "User Directory";
    if (path.startsWith("/admin/jobs")) return "Job Moderation";
    if (path.startsWith("/admin/companies")) return "Company Badges";
    if (path.startsWith("/admin/plans")) return "Membership Plans";
    if (path.startsWith("/admin/subscriptions")) return "Subscriptions";
    if (path.startsWith("/admin/bookings")) return "Consultation Bookings";
    if (path.startsWith("/admin/inquiries")) return "Contact Inquiries";
    if (path.startsWith("/admin/homepage")) return "Homepage & Media";
    if (path.startsWith("/admin/audit-logs")) return "Audit Activity Logs";
    if (path.startsWith("/admin/settings")) return "System Settings";
    return "Admin Dashboard";
  };

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
        { label: "Homepage & Media", href: "/admin/homepage", icon: Film },
        { label: "Service Products", href: "/admin/services", icon: ShoppingBag },
        { label: "Consultation Bookings", href: "/admin/bookings", icon: Calendar },
        { label: "Contact Inquiries", href: "/admin/inquiries", icon: MessageSquare },
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
    <div className="h-dvh bg-slate-50 text-slate-800 flex overflow-hidden selection:bg-sky-500 selection:text-white">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 w-72 h-dvh bg-white border-none flex flex-col justify-between shrink-0 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full min-h-0">
          <div className="p-5 flex items-center justify-between shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <BrandLogo size="sm" href="" priority />
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-600 border border-sky-200/60 uppercase tracking-wider">
                Admin
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="p-4 space-y-5 overflow-y-auto flex-1 min-h-0">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <h4 className="px-3 text-xs font-semibold text-slate-400">
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
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                        isActive
                          ? "bg-sky-50 text-sky-600 font-bold shadow-xs  border-sky-100"
                          : "text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-sky-600" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-white shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-dvh overflow-hidden bg-slate-50">
        <header className="h-16 px-6 bg-white/95 border-b border-slate-200/80 backdrop-blur-md flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                {getActivePageName(pathname)}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-xs font-semibold transition-colors"
            >
              <span>Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:border-l sm:border-slate-200">
              {user?.avatarUrl || user?.avatar ? (
                <img
                  src={user.avatarUrl || user.avatar}
                  alt={user?.name || "Admin"}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-sky-500/20 border border-slate-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              )}

              <div className="flex flex-col min-w-0">
                <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate leading-tight">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[11px] text-slate-500 truncate leading-tight">
                  {user?.email || "admin@iformat.com"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-h-0 p-6 sm:p-8 pb-16 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
