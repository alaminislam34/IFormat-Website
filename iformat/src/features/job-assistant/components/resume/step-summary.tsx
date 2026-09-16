"use client";

import React from "react";
import { FileText, ChevronRight } from "lucide-react";
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
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Professional Summary <span className="text-rose-500">*</span></h2>
            <p className="text-xs text-slate-500">Write your career highlights, expertise, and core skills.</p>
          </div>
        </div>
      </div>

      <div className="relative space-y-1.5">
        <textarea
          rows={8}
          value={summary ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write about yourself, your career highlights, major achievements, and core skills..."
          className={`w-full p-5 rounded-2xl border transition-all text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 ${
            errors?.summary
              ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
              : "border-slate-200 bg-slate-50/50 text-slate-800 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white"
          }`}
        />
        {errors?.summary && (
          <p className="text-[11px] font-medium text-rose-500">{errors.summary}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
          Previous
        </Button>
        <Button onClick={onNext} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
