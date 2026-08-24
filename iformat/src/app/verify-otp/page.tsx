"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/features/auth/components/auth-layout";
import { LoadingScreen } from "@/features/auth/components/loading-screen";
import { useVerifyOtp, useResendOtp } from "@/hooks";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const [codeError, setCodeError] = useState("");

  const handleOtpChange = (index: number, value: string) => {
    if (codeError) setCodeError("");
    if (value.length > 1) {
      // Handle paste
      const pasted = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setCodeError("Please enter the complete 6-digit verification code");
      return;
    }
    if (!email) {
      toast.error("Please provide your email address");
      return;
    }

    setCodeError("");
    setIsLoading(true);
    verifyOtpMutation.mutate(
      { email, code, type: "EMAIL_VERIFICATION" },
      {
        onSuccess: () => {
          setIsLoading(false);
          setIsSuccess(true);
          toast.success("Email verified successfully!");
        },
        onError: (err) => {
          setIsLoading(false);
          setCodeError(err.message || "Invalid or expired verification code");
        },
      }
    );
  };

  const handleResend = () => {
    if (!canResend || !email) return;

    setCanResend(false);
    setCountdown(60);

    resendOtpMutation.mutate(
      { email, type: "EMAIL_VERIFICATION" },
      {
        onSuccess: () => {
          toast.success("A new 6-digit verification code has been sent!");
        },
        onError: (err) => {
          toast.error(err.message || "Failed to resend verification code.");
        },
      }
    );
  };

  return (
    <AuthLayout illustrationType="sitting">
      <AnimatePresence>
        {isLoading && <LoadingScreen message="Verifying your code..." />}
      </AnimatePresence>

      <div className="flex flex-col h-full justify-center">
        {!isSuccess ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              Verify your email
            </h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-semibold text-slate-800">{email || "your email"}</span>.
              Please enter the code below to activate your account.
            </p>

            {!emailParam && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex h-12 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                  />
                </div>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-6">
              {/* 6 Digit Input Group */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Verification Code
                </label>
                <div className="flex items-center justify-between gap-2 md:gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 md:w-14 md:h-16 text-center text-xl md:text-2xl font-bold rounded-xl border ${
                        codeError
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                      } bg-slate-50/50 text-slate-950 focus:outline-none focus:ring-4 transition-all`}
                    />
                  ))}
                </div>
                {codeError && (
                  <p className="text-xs text-red-500 mt-2 font-medium text-center">{codeError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={otp.join("").length < 6}
                className="w-full h-12 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify & Continue <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Resend OTP */}
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-slate-500">Didn&apos;t receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-bold text-[#0A54B1] hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                </button>
              ) : (
                <span className="text-slate-400 font-medium">
                  Resend in {countdown}s
                </span>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0A54B1] hover:underline"
              >
                ← Back to login
              </Link>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Verified!</h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed max-w-sm">
              Your account has been successfully verified. You can now proceed to set up your profile.
            </p>
            <button
              onClick={() => router.push("/account-type")}
              className="w-full h-12 bg-[#0A54B1] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
            >
              Continue to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A54B1]" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
