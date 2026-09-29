"use client";

import React from "react";
import { Briefcase, Building2, Calendar, MapPin, Trash2, Plus, ChevronRight, FileText } from "lucide-react";
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
        <div className="w-10 h-10 bg-blue-50 text-[#0A54B1] rounded-xl flex items-center justify-center">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Work Experience <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Detail your relevant work roles, achievements, and quantifiable business impact.
          </p>
        </div>
      </div>

      {errors?.workExperience && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <span>{errors.workExperience}</span>
        </div>
      )}

      <div className="space-y-6">
        {workExperience.map((work, index) => {
          const itemError = errors?.[`work_${work.id}`];
          return (
            <div
              key={work.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                itemError
                  ? "border-rose-300 bg-rose-50/15"
                  : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-white hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Position #{index + 1}
                </span>
                {workExperience.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(work.id)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              {itemError && (
                <div className="mb-4 pb-3 border-b border-rose-200 text-xs font-semibold text-rose-600 flex items-center gap-1.5">
                  <span>{itemError}</span>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Company Name</label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={work.company ?? ""}
                      onChange={(e) => onChange(work.id, "company", e.target.value)}
                      placeholder="e.g. Vercel Inc"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Job Role / Title</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={work.role ?? ""}
                      onChange={(e) => onChange(work.id, "role", e.target.value)}
                      placeholder="e.g. Senior Full Stack Developer"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Employment Duration</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={work.duration ?? ""}
                      onChange={(e) => onChange(work.id, "duration", e.target.value)}
                      placeholder="e.g. Jan 2021 - Present"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={work.location ?? ""}
                      onChange={(e) => onChange(work.id, "location", e.target.value)}
                      placeholder="e.g. Paris, France or Remote"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Key Responsibilities & Impact
                    </label>
                    <span className="text-[11px] text-slate-400">One bullet point per line</span>
                  </div>
                  <textarea
                    rows={4}
                    value={work.description ?? ""}
                    onChange={(e) => onChange(work.id, "description", e.target.value)}
                    placeholder="Led development of core cloud-native features...&#10;Decreased application response time by 35%...&#10;Mentored 5 junior engineers and established CI/CD pipelines..."
                    className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium leading-relaxed resize-none transition-all"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAdd}
          className="w-full py-3.5 border-2 border-dashed border-sky-300 hover:border-[#0A54B1] rounded-2xl flex items-center justify-center gap-2 text-[#0A54B1] hover:text-[#0A54B1] bg-sky-50/30 hover:bg-sky-50/70 transition-all font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Another Experience
        </button>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700 cursor-pointer">
          Previous
        </Button>
        <Button onClick={onNext} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/15">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
