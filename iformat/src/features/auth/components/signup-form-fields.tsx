"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";
import { SignupFormData } from "@/lib/validations";

interface SignupFormFieldsProps {
  register: UseFormRegister<SignupFormData>;
  errors: FieldErrors<SignupFormData>;
  watch: UseFormWatch<SignupFormData>;
}

export function SignupFormFields({
  register,
  errors,
  watch,
}: SignupFormFieldsProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      {/* Email Input */}
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
            placeholder="name@example.com"
            {...register("email")}
            className={`flex h-12 w-full rounded-xl border ${
              errors.email
                ? "border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
            } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
          />
        </div>
        {errors.email && (
          <div className="flex flex-col gap-1 mt-1.5">
            <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
            {errors.email.message?.includes("already exists") && (
              <p className="text-xs text-slate-600">
                Need to verify this email?{" "}
                <Link
                  href={`/verify-otp?email=${encodeURIComponent(watch("email") || "")}`}
                  className="text-[#0A54B1] font-bold hover:underline"
                >
                  Verify Email Now →
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Full Name & Password (Side by side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Bonnie Green"
              {...register("fullName")}
              className={`flex h-12 w-full rounded-xl border ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
              } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2"
          >
            Password
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
      </div>

      {/* Checkboxes */}
      <div className="space-y-3 pt-2">
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              {...register("agreeTerms")}
              className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-[#0A54B1] focus:ring-[#0A54B1]/20 transition-all cursor-pointer"
            />
            <span className="text-xs text-slate-600 group-hover:text-slate-800 leading-snug transition-colors">
              By signing up, you are creating an iFormat account, and you agree to iFormat&apos;s{" "}
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
          {errors.agreeTerms && (
            <p className="text-xs text-red-500 mt-1 font-medium ml-7">
              {errors.agreeTerms.message}
            </p>
          )}
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            {...register("agreeMarketing")}
            className="w-4.5 h-4.5 mt-0.5 rounded border-slate-300 text-[#0A54B1] focus:ring-[#0A54B1]/20 transition-all cursor-pointer"
          />
          <span className="text-xs text-slate-600 group-hover:text-slate-800 leading-snug transition-colors">
            Email me about product updates and resources.
          </span>
        </label>
      </div>
    </>
  );
}
