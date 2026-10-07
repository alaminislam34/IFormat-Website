"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";

interface VerifyOtpSuccessProps {
  redirectUrl?: string;
}

export function VerifyOtpSuccess({ redirectUrl }: VerifyOtpSuccessProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [countdown, setCountdown] = React.useState(3);

  // Compute the correct destination for the verified user
  const getDestination = React.useCallback(() => {
    if (redirectUrl && redirectUrl.startsWith("/") && redirectUrl !== "/account-type") {
      return redirectUrl;
    }
    const role = user?.role?.toUpperCase();
    if (role === "ADMIN") {
      return "/admin";
    }
    if (role === "EMPLOYER") {
      return user?.companyName?.trim() ? "/dashboard" : "/company-details";
    }
    return "/job-portal";
  }, [redirectUrl, user]);

  const targetUrl = getDestination();
  const role = user?.role?.toUpperCase();
  const isEmployer = role === "EMPLOYER";
  const isAdmin = role === "ADMIN";

  const actionLabel =
    redirectUrl && redirectUrl.startsWith("/") && redirectUrl !== "/account-type"
      ? "Continue"
      : isAdmin
      ? "Go to Admin Dashboard"
      : isEmployer
      ? "Go to Employer Dashboard"
      : "Go to Job Portal";

  const handleNext = () => {
    router.push(targetUrl);
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push(targetUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, targetUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center p-6 sm:p-8 pb-8 sm:pb-9 bg-slate-50/70 rounded-3xl border border-slate-100 shadow-xs space-y-5"
    >
      <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Email Verified!</h3>
        <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
          {isEmployer
            ? "Your employer account has been successfully verified. Welcome to iFormat!"
            : isAdmin
            ? "Your administrator account has been successfully verified."
            : "Your candidate account has been successfully verified. Welcome to iFormat!"}
        </p>
      </div>
      <div className="w-full pt-2">
        <button
          onClick={handleNext}
          className="w-full h-12 bg-[#0A54B1] hover:bg-[#08428c] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:opacity-95 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>{actionLabel} ({countdown}s)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
