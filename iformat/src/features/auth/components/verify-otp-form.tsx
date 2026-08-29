"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight, RefreshCw } from "lucide-react";

interface VerifyOtpFormProps {
  email: string;
  emailParam: string;
  setEmail: (e: string) => void;
  otp: string[];
  codeError: string;
  canResend: boolean;
  countdown: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onOtpChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerify: (e?: React.FormEvent) => void;
  onResend: () => void;
}

export function VerifyOtpForm({
  email,
  emailParam,
  setEmail,
  otp,
  codeError,
  canResend,
  countdown,
  inputRefs,
  onOtpChange,
  onKeyDown,
  onVerify,
  onResend,
}: VerifyOtpFormProps) {
  return (
    <>
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mb-4">
        <ShieldCheck className="w-6 h-6" />
      </div>

      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Verify your email
      </h2>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        We&apos;ve sent a 6-digit verification code to{" "}
        <span className="font-semibold text-slate-800">{email || "your email"}</span>. Please
        enter the code below to activate your account.
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

      <form onSubmit={onVerify} className="space-y-6">
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
                onChange={(e) => onOtpChange(index, e.target.value)}
                onKeyDown={(e) => onKeyDown(index, e)}
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
            onClick={onResend}
            className="font-bold text-[#0A54B1] hover:underline flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Resend Code
          </button>
        ) : (
          <span className="text-slate-400 font-medium">Resend in {countdown}s</span>
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
  );
}
