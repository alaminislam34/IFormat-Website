"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form";
import { AlertCircle, Calendar } from "lucide-react";
import { CreateJobFormData } from "@/lib/validations/job.schema";
import { cn } from "@/lib/utils";

interface JobFormFieldsProps {
  register: UseFormRegister<CreateJobFormData>;
  errors: FieldErrors<CreateJobFormData>;
  setValue: UseFormSetValue<CreateJobFormData>;
  selectedJobType?: string;
  selectedLocation?: string;
}

export function JobFormFields({
  register,
  errors,
  setValue,
  selectedJobType,
  selectedLocation,
}: JobFormFieldsProps) {
  return (
    <div className="space-y-5">
      {/* Job Title */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Job Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Senior Full Stack Developer"
          {...register("title")}
          className={cn(
            "w-full h-11 px-4 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
            errors.title
              ? "border-rose-300 focus:ring-rose-200"
              : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
          )}
        />
        {errors.title && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
          </p>
        )}
      </div>

      {/* Company Name */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Company Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Acme Corp"
          {...register("company")}
          className={cn(
            "w-full h-11 px-4 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
            errors.company
              ? "border-rose-300 focus:ring-rose-200"
              : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
          )}
        />
        {errors.company && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.company.message}
          </p>
        )}
      </div>

      {/* Industry/Category & Salary */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Industry / Category
          </label>
          <select
            {...register("category")}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all cursor-pointer"
          >
            <option>Technology & Engineering</option>
            <option>Design & Creative</option>
            <option>Business & Marketing</option>
            <option>Data & AI</option>
            <option>Finance & Operations</option>
            <option>Product & Management</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Salary Range
          </label>
          <input
            type="text"
            placeholder="e.g. $80,000 - $100,000"
            {...register("salary")}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all"
          />
        </div>
      </div>

      {/* Job Type & Work Location */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Job Type
          </label>
          <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
            {(["Full Time", "Part Time", "Contract"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setValue("jobType", type)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer focus:outline-none",
                  selectedJobType === type
                    ? "bg-white border-sky-100 text-sky-600 shadow-xs"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Work Location
          </label>
          <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
            {(["Remote", "Onsite", "Hybrid"] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setValue("location", loc)}
                className={cn(
                  "flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer focus:outline-none",
                  selectedLocation === loc
                    ? "bg-white border-sky-100 text-sky-600 shadow-xs"
                    : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Job Validity */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Job Validity <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            {...register("validity")}
            className={cn(
              "w-full h-11 px-4 pr-10 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer",
              errors.validity
                ? "border-rose-300 focus:ring-rose-200"
                : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
            )}
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
        {errors.validity && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.validity.message}
          </p>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Job Description / About the Role <span className="text-rose-500">*</span>
        </label>
        <textarea
          placeholder="Describe the role, team, and what the candidate will work on..."
          rows={3}
          {...register("description")}
          className={cn(
            "w-full px-4 py-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all resize-none",
            errors.description
              ? "border-rose-300 focus:ring-rose-200"
              : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
          )}
        />
        {errors.description && (
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
            <AlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
          </p>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Requirements <span className="text-slate-400">(one per line)</span>
        </label>
        <textarea
          placeholder="4+ years of experience in React&#10;Proficiency in Node.js&#10;Strong communication skills"
          rows={3}
          {...register("requirements")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
        />
      </div>

      {/* Nice to have */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Nice To Have <span className="text-slate-400">(one per line)</span>
        </label>
        <textarea
          placeholder="Open-source contributions&#10;Relevant certifications"
          rows={2}
          {...register("niceToHave")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
        />
      </div>

      {/* Benefits & Perks */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Benefits & Perks <span className="text-slate-400">(one per line)</span>
        </label>
        <textarea
          placeholder="Competitive salary&#10;Remote-first&#10;Unlimited PTO"
          rows={2}
          {...register("perks")}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
        />
      </div>
    </div>
  );
}
