"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UserMenu } from "@/components/layout/user-menu";
import { BrandLogo } from "@/components/ui/brand-logo";
import { useScrollDirection } from "@/hooks/use-scroll-direction";

export function Navbar() {
  const { scrollDirection, isAtTop } = useScrollDirection(8);
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isHomePage = pathname === "/";

  // Hide on scroll DOWN when not at top; show on scroll UP or when at top
  const isHidden = !isAtTop && scrollDirection === "down" && !isMobileOpen;
  // Frosted white glass styling when scrolled past hero / top
  const isScrolled = !isAtTop;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-200 ease-out ${
        isHidden
          ? "-translate-y-full opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100"
      } ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-md shadow-slate-900/5 py-4"
          : isHomePage
          ? "bg-transparent py-6"
          : "bg-white border-b border-slate-100 py-5"
      }`}
    >
      <div className="max-w-350 mx-auto px-8 md:px-12 lg:px-16 flex items-center justify-between w-full">
        {/* Brand Logo */}
        <BrandLogo variant={!isScrolled && isHomePage ? "dark" : "light"} />
        
        {/* Desktop Nav Links */}
        <div
          className={`hidden md:flex items-center gap-8 text-sm font-semibold transition-colors ${
            !isScrolled && isHomePage
              ? "text-white/90"
              : "text-slate-600"
          }`}
        >
          <Link href="/#about" className="hover:text-[#0A54B1] transition-colors">
            About
          </Link>
          <Link href="/services" className="hover:text-[#0A54B1] transition-colors">
            Solutions
          </Link>
          <Link href="/job-assistant" className="hover:text-[#0A54B1] transition-colors">
            Job Assistant
          </Link>
          <Link href="/job-portal" className="hover:text-[#0A54B1] transition-colors">
            Job Portal
          </Link>
        </div>

        {/* Action Buttons & Profile */}
        <div className="flex items-center gap-3">
          <Link href="/services">
            <button className="hidden sm:inline-flex items-center px-5 h-10 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-xs sm:text-sm font-bold hover:opacity-95 transition-all shadow-md active:scale-95 cursor-pointer">
              Book a Free Consult
            </button>
          </Link>
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-100 bg-white px-8 py-5 space-y-4 shadow-xl"
          >
            <div className="flex flex-col gap-2 font-semibold text-slate-700 text-sm">
              <Link
                href="/#about"
                onClick={() => setIsMobileOpen(false)}
                className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-50"
              >
                About
              </Link>
              <Link
                href="/services"
                onClick={() => setIsMobileOpen(false)}
                className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-50"
              >
                Solutions
              </Link>
              <Link
                href="/job-assistant"
                onClick={() => setIsMobileOpen(false)}
                className="py-2.5 hover:text-[#0A54B1] transition-colors border-b border-slate-50"
              >
                Job Assistant
              </Link>
              <Link
                href="/job-portal"
                onClick={() => setIsMobileOpen(false)}
                className="py-2.5 hover:text-[#0A54B1] transition-colors"
              >
                Job Portal
              </Link>
            </div>
            <div className="pt-2 space-y-2">
              <Link
                href="/services"
                onClick={() => setIsMobileOpen(false)}
                className="block w-full py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-center text-xs font-bold shadow-sm"
              >
                Book a Free Consult
              </Link>
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
  );
}
