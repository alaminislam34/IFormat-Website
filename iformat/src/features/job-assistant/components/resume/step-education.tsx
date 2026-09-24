"use client";

import React from "react";
import { GraduationCap, Award, Calendar, MapPin, Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepEducationProps {
  education: ResumeData["education"];
  errors?: Record<string, string>;
  onChange: (id: string, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepEducation({
  education,
  errors = {},
  onChange,
  onAdd,
  onRemove,
  onPrev,
  onNext,
}: StepEducationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step4"
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-[#0A54B1] rounded-xl flex items-center justify-center">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Education <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Add your degrees, universities, academic achievements, and graduation years.
          </p>
        </div>
      </div>

      {errors?.education && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <span>{errors.education}</span>
        </div>
      )}

      <div className="space-y-6">
        {education.map((edu, index) => {
          const itemError = errors?.[`edu_${edu.id}`];
          return (
            <div
              key={edu.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                itemError
                  ? "border-rose-300 bg-rose-50/15"
                  : "bg-slate-50/60 border-slate-200/80 hover:border-slate-300 hover:bg-white hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Degree #{index + 1}
                </span>
                {education.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(edu.id)}
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
                  <label className="text-xs font-bold text-slate-700">Institution / University</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.institution ?? ""}
                      onChange={(e) => onChange(edu.id, "institution", e.target.value)}
                      placeholder="e.g. Sorbonne University"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Degree & Major</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.degree ?? ""}
                      onChange={(e) => onChange(edu.id, "degree", e.target.value)}
                      placeholder="e.g. Master of Computer Science"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Years Attended</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={edu.duration ?? ""}
                      onChange={(e) => onChange(edu.id, "duration", e.target.value)}
                      placeholder="e.g. 2018 - 2022"
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
                      value={edu.location ?? ""}
                      onChange={(e) => onChange(edu.id, "location", e.target.value)}
                      placeholder="e.g. Paris, France"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium transition-all"
                    />
                  </div>
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
          <Plus className="w-4 h-4" /> Add Another Degree / Education
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
