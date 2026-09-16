"use client";

import React from "react";
import { UseFormRegister, FieldErrors, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { CreateJobFormData } from "@/lib/validations/job.schema";
import { SalaryRangeField } from "./salary-range-field";
import { PremiumDatePicker } from "./premium-date-picker";
import { cn } from "@/lib/utils";

interface JobFormFieldsProps {
  register: UseFormRegister<CreateJobFormData>;
  errors: FieldErrors<CreateJobFormData>;
  setValue: UseFormSetValue<CreateJobFormData>;
  watch?: UseFormWatch<CreateJobFormData>;
  selectedJobType?: string;
  selectedLocation?: string;
}

export function JobFormFields({
  register,
  errors,
  setValue,
  watch,
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

      {/* Industry / Category */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Industry / Category
        </label>
        <select
          {...register("category")}
          className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all cursor-pointer"
        >
          {(() => {
            const currentCat = watch ? watch("category") : undefined;
            const standardCategories = [
              "Technology & Engineering",
              "Design & Creative",
              "Business & Marketing",
              "Data & AI",
              "Finance & Operations",
              "Product & Management",
            ];
            const categories = currentCat && !standardCategories.includes(currentCat)
              ? [currentCat, ...standardCategories]
              : standardCategories;

            return categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ));
          })()}
        </select>
      </div>

      {/* Structured & Validated Salary Range Field */}
      <SalaryRangeField
        setValue={setValue}
        watch={watch}
        errors={errors}
      />
      {/* Ensure React Hook Form registers salary field */}
      <input type="hidden" {...register("salary")} />

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

      {/* Premium Job Validity Date Picker */}
      <PremiumDatePicker
        setValue={setValue}
        watch={watch}
        errors={errors}
      />
      <input type="hidden" {...register("validity")} />

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
