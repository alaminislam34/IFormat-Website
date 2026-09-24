"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "@/components/layout/user-menu";
import { BrandLogo } from "@/components/ui/brand-logo";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { useAuthStore } from "@/stores/use-auth-store";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const isEmployer = isAuthenticated && (user?.role === "employer" || user?.role === "EMPLOYER");
  const { scrollDirection, isAtTop } = useScrollDirection(8, pathname);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const isHomePage = pathname === "/";

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("consult=open")) {
      if (isAuthenticated) {
        setIsConsultModalOpen(true);
        setIsAuthPromptOpen(false);
      } else {
        setIsAuthPromptOpen(true);
        setIsConsultModalOpen(false);
      }
    }
  }, [isAuthenticated]);

  const handleConsultClick = () => {
    if (!isAuthenticated) {
      setIsAuthPromptOpen(true);
    } else {
      setIsConsultModalOpen(true);
    }
  };

  const consultRedirectUrl = pathname
    ? `${pathname}${pathname.includes("?") ? "&" : "?"}consult=open`
    : "/?consult=open";

  const isHidden = !isAtTop && scrollDirection === "down" && !isMobileOpen;
  const isScrolled = !isAtTop;

  return (
    <>
      <BookConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        serviceTitle="Free 1-on-1 Career Strategy Consultation"
      />

      <AuthPromptModal
        isOpen={isAuthPromptOpen}
        onClose={() => setIsAuthPromptOpen(false)}
        title="Sign In to Book a Free Consult"
        description="Please sign in or create an account to book your free career consultation session."
        redirectUrl={consultRedirectUrl}
        perks={[
          "1-on-1 personalized career strategy advice",
          "Comprehensive resume & portfolio evaluation",
          "Targeted roadmap for executive & tech opportunities",
        ]}
      />

      <header
        className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-200 ease-out print:hidden no-print ${
          isHidden
            ? "-translate-y-full opacity-0 pointer-events-none"
            : "translate-y-0 opacity-100"
        } ${
          isScrolled
            ? "bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-slate-900/5 py-4"
            : isHomePage
            ? "bg-transparent border-b border-white/0 py-6"
            : "bg-white border-b border-slate-100 py-5"
        }`}
      >
        <div className="max-w-360 mx-auto w-11/12 flex items-center justify-between">
          <BrandLogo variant={!isScrolled && isHomePage ? "dark" : "light"} />
          
          <div
            className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors ${
              !isScrolled && isHomePage
                ? "text-white/90"
                : "text-slate-600"
            }`}
          >
            <Link
              href="/"
              className={`transition-all ${
                !isScrolled && isHomePage
                  ? "hover:text-[#52CEDE] hover:drop-shadow-[0_0_8px_rgba(82,206,222,0.7)]"
                  : "hover:text-[#0A54B1]"
              }`}
            >
              Home
            </Link>
            <Link
              href="/services"
              className={`transition-all ${
                !isScrolled && isHomePage
                  ? "hover:text-[#52CEDE] hover:drop-shadow-[0_0_8px_rgba(82,206,222,0.7)]"
                  : "hover:text-[#0A54B1]"
              }`}
            >
              Solutions
            </Link>
            {!isEmployer && (
              <Link
                href="/job-assistant"
                className={`transition-all ${
                  !isScrolled && isHomePage
                    ? "hover:text-[#52CEDE] hover:drop-shadow-[0_0_8px_rgba(82,206,222,0.7)]"
                    : "hover:text-[#0A54B1]"
                }`}
              >
                Job Assistant
              </Link>
            )}
            <Link
              href="/job-portal"
              className={`transition-all ${
                !isScrolled && isHomePage
                  ? "hover:text-[#52CEDE] hover:drop-shadow-[0_0_8px_rgba(82,206,222,0.7)]"
                  : "hover:text-[#0A54B1]"
              }`}
            >
              Job Portal
            </Link>
          </div>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleConsultClick}
              className="hidden sm:inline-flex items-center px-5 h-10 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Book a Free Consult
            </button>
            <UserMenu variant={!isScrolled && isHomePage ? "dark" : "light"} />

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
                !isScrolled && isHomePage
                  ? "border-white/20 text-white bg-white/10 hover:bg-white/20"
                  : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
              }`}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 px-8 py-6 space-y-4 shadow-xl"
            >
              <div className="flex flex-col gap-3 font-semibold text-slate-700 text-sm">
                <Link
                  href="/#about"
                  onClick={() => setIsMobileOpen(false)}
                  className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-100"
                >
                  About
                </Link>
                <Link
                  href="/services"
                  onClick={() => setIsMobileOpen(false)}
                  className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-100"
                >
                  Solutions
                </Link>
                {isEmployer ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsMobileOpen(false)}
                    className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-100"
                  >
                    Employer Hub
                  </Link>
                ) : (
                  <Link
                    href="/job-assistant"
                    onClick={() => setIsMobileOpen(false)}
                    className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-100"
                  >
                    Job Assistant
                  </Link>
                )}
                <Link
                  href="/job-portal"
                  onClick={() => setIsMobileOpen(false)}
                  className="py-2.5 hover:text-[#0A54B1] transition-colors"
                >
                  Job Portal
                </Link>
              </div>
              <div className="pt-2 space-y-2">
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    handleConsultClick();
                  }}
                  className="block w-full py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-center text-xs font-bold shadow-sm cursor-pointer"
                >
                  Book a Free Consult
                </button>
                <Link
                  href="/signup"
                  onClick={() => setIsMobileOpen(false)}
                  className="block w-full py-2.5 rounded-xl bg-slate-900 text-white text-center text-xs font-bold shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
