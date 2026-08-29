"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, ShieldCheck } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResetPasswordFormData } from "@/lib/validations";

interface ResetPasswordFormProps {
  token: string;
  email: string;
  setEmail: (e: string) => void;
  code: string;
  setCode: (c: string) => void;
  emailError: string;
  codeError: string;
  agreeTerms: boolean;
  setAgreeTerms: (a: boolean) => void;
  agreeError: string;
  register: UseFormRegister<ResetPasswordFormData>;
  errors: FieldErrors<ResetPasswordFormData>;
  onSubmit: (e: React.FormEvent) => void;
}

export function ResetPasswordForm({
  token,
  email,
  setEmail,
  code,
  setCode,
  emailError,
  codeError,
  agreeTerms,
  setAgreeTerms,
  agreeError,
  register,
  errors,
  onSubmit,
}: ResetPasswordFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Create new password
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        Your new password must be at least 6 characters long.
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* If no token was in query URL, ask for Email + 6-digit Reset Code */}
        {!token && (
          <>
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`flex h-12 w-full rounded-xl border ${
                    emailError
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                  } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1 font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="code"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
              >
                6-Digit Reset Code
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <input
                  id="code"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className={`flex h-12 w-full rounded-xl border ${
                    codeError
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
                  } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm tracking-widest font-mono text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {codeError && (
                <p className="text-xs text-red-500 mt-1 font-medium">{codeError}</p>
              )}
            </div>
          </>
        )}

        {/* Password Input */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            New Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••••••"
              {...register("password")}
              className={`flex h-12 w-full rounded-xl border ${
                errors.password
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
              } bg-slate-50/50 px-3.5 pl-10 pr-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Lock className="w-4 h-4" />
            </span>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••••••"
              {...register("confirmPassword")}
              className={`flex h-12 w-full rounded-xl border ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
              } bg-slate-50/50 px-3.5 pl-10 pr-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Checkbox */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-[#0A54B1] focus:ring-[#0A54B1]/20 transition-all cursor-pointer"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-800 leading-snug transition-colors">
              I agree to the{" "}
              <Link href="#" className="text-[#0A54B1] font-semibold hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-[#0A54B1] font-semibold hover:underline">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
          {agreeError && (
            <p className="text-xs text-red-500 mt-1 font-medium ml-7">{agreeError}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full h-12 mt-2 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:opacity-95 hover:shadow-xl transition-all duration-200 active:scale-[0.99] flex items-center justify-center cursor-pointer"
        >
          Update Password
        </button>
      </form>

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
