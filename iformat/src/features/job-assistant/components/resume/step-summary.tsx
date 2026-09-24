"use client";

import React from "react";
import { FileText, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface StepSummaryProps {
  summary: string;
  errors?: Record<string, string>;
  onChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepSummary({ summary, errors = {}, onChange, onPrev, onNext }: StepSummaryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step2"
      className="space-y-6"
    >
      {/* Step Header */}
      <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100">
        <div className="w-11 h-11 bg-sky-50 text-[#0A54B1] rounded-2xl border border-sky-100 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-[#0A54B1]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Professional Summary <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Summarize your career trajectory, core domain expertise, and signature achievements.
          </p>
        </div>
      </div>

      {/* Pro Tip Box */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-600">
        <Lightbulb className="w-4 h-4 text-[#0A54B1] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-900">Pro Tip:</strong> 3-4 concise sentences work best. Mention your years in the industry, your core superpowers, and one or two measurable results.
        </p>
      </div>

      {/* Summary Textarea */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700">
          Executive Summary / Bio
        </label>
        <textarea
          rows={7}
          value={summary ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Results-driven Product Designer with 6+ years of experience crafting enterprise B2B software. Led design teams scaling revenue from $2M to $15M ARR..."
          className={`w-full p-4 rounded-xl border transition-all text-xs sm:text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 shadow-2xs ${
            errors?.summary
              ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
          }`}
        />
        {errors?.summary && (
          <p className="text-[11px] font-semibold text-rose-500">{errors.summary}</p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-5 border-t border-slate-100">
        <Button
          onClick={onPrev}
          variant="outline"
          className="h-11 px-5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </Button>
        <Button
          onClick={onNext}
          className="h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Next: Work Experience</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
