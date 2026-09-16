"use client";

import React from "react";
import { Briefcase, Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepWorkExperienceProps {
  workExperience: ResumeData["workExperience"];
  errors?: Record<string, string>;
  onChange: (id: string, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepWorkExperience({
  workExperience,
  errors = {},
  onChange,
  onAdd,
  onRemove,
  onPrev,
  onNext,
}: StepWorkExperienceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step3"
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Work Experience <span className="text-rose-500">*</span></h2>
          <p className="text-xs text-slate-500">List your relevant roles, achievements, and impact.</p>
        </div>
      </div>

      {errors?.workExperience && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <span>{errors.workExperience}</span>
        </div>
      )}

      <div className="space-y-6">
        {workExperience.map((work) => {
          const itemError = errors?.[`work_${work.id}`];
          return (
          <div
            key={work.id}
            className={`rounded-2xl border p-6 relative group transition-all ${
              itemError
                ? "border-rose-300 bg-rose-50/15"
                : "bg-slate-50/50 border-slate-100 hover:border-slate-200 hover:bg-white"
            }`}
          >
            {itemError && (
              <div className="mb-4 pb-3 border-b border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                <span>{itemError}</span>
              </div>
            )}
            {workExperience.length > 1 && (
              <button
                onClick={() => onRemove(work.id)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                <input
                  type="text"
                  value={work.company ?? ""}
                  onChange={(e) => onChange(work.id, "company", e.target.value)}
                  placeholder="e.g. Vercel Inc"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
                <input
                  type="text"
                  value={work.role ?? ""}
                  onChange={(e) => onChange(work.id, "role", e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                <input
                  type="text"
                  value={work.duration ?? ""}
                  onChange={(e) => onChange(work.id, "duration", e.target.value)}
                  placeholder="e.g. Jan 2020 - Present"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={work.location ?? ""}
                  onChange={(e) => onChange(work.id, "location", e.target.value)}
                  placeholder="e.g. Remote / Paris, France"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description (One point per line)</label>
                <textarea
                  rows={4}
                  value={work.description ?? ""}
                  onChange={(e) => onChange(work.id, "description", e.target.value)}
                  placeholder="Led a team of developers...&#10;Built and optimized APIs..."
                  className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium leading-relaxed resize-none"
                />
              </div>
            </div>
          </div>
        );
      })}

        <button
          onClick={onAdd}
          className="w-full py-4 border border-dashed border-sky-300 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-2 text-sky-600 hover:text-sky-700 bg-sky-50/20 hover:bg-sky-50/50 transition-all font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Work Experience
        </button>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
          Previous
        </Button>
        <Button onClick={onNext} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
