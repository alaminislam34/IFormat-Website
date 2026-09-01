"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/brand-logo";

interface AuthLayoutProps {
  children: React.ReactNode;
  illustrationType: "standing" | "sitting" | "office";
}

export function AuthLayout({ children, illustrationType }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white px-4 py-8 md:p-12 lg:p-16 overflow-x-hidden">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Form Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-6 xl:col-span-5 w-full flex justify-center lg:justify-end"
        >
          <div className="w-full max-w-115 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10 relative overflow-hidden">
            {/* Logo */}
            <div className="mb-8">
              <BrandLogo size="lg" />
            </div>

            {/* Form Content */}
            {children}
          </div>
        </motion.div>

        {/* Right Side: Illustration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="hidden lg:col-span-6 xl:col-span-7 lg:flex items-center justify-center w-full"
        >
          {illustrationType === "standing" && (
            <Image
              src="/Illustration.svg"
              alt="iFormat Standing Illustration"
              width={467}
              height={578}
              priority
              className="max-h-[75vh] w-auto object-contain select-none pointer-events-none"
            />
          )}
          {illustrationType === "sitting" && (
            <Image
              src="/image 4.svg"
              alt="iFormat Sitting Illustration"
              width={467}
              height={467}
              priority
              className="max-h-[65vh] w-auto object-contain select-none pointer-events-none"
            />
          )}
          {illustrationType === "office" && (
            <Image
              src="/OFFICE.psd.svg"
              alt="iFormat Office Illustration"
              width={559}
              height={559}
              priority
              className="max-h-[70vh] w-auto object-contain select-none pointer-events-none"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
