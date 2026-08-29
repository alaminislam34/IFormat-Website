"use client";

import React from "react";
import { User, Mail } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ApplyCandidateFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function ApplyCandidateFields({ register, errors }: ApplyCandidateFieldsProps) {
  return (
    <>
      {/* Full Name */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Full Name
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <User className="w-4 h-4" />
          </span>
          <input
            type="text"
            {...register("candidateName")}
            placeholder="e.g. Sarah Jenkins"
            className={`flex h-11 w-full rounded-xl border ${
              errors.candidateName
                ? "border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
            } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
          />
        </div>
        {errors.candidateName && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            {errors.candidateName.message as string}
          </p>
        )}
      </div>

      {/* Email Address */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Mail className="w-4 h-4" />
          </span>
          <input
            type="email"
            {...register("candidateEmail")}
            placeholder="you@example.com"
            className={`flex h-11 w-full rounded-xl border ${
              errors.candidateEmail
                ? "border-red-500 focus:ring-red-500/20"
                : "border-slate-200 focus:border-[#0A54B1] focus:ring-[#0A54B1]/20"
            } bg-slate-50/50 px-3.5 pl-10 py-2 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none focus:ring-4 transition-all`}
          />
        </div>
        {errors.candidateEmail && (
          <p className="text-xs text-red-500 mt-1 font-medium">
            {errors.candidateEmail.message as string}
          </p>
        )}
      </div>
    </>
  );
}
