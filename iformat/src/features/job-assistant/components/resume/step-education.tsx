"use client";

import React from "react";
import { GraduationCap, Trash2, Plus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepEducationProps {
  education: ResumeData["education"];
  onChange: (id: string, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepEducation({
  education,
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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Education</h2>
        </div>
        <p className="text-xs text-slate-500 pl-13">Add your academic background and achievements.</p>
      </div>

      <div className="space-y-6">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 relative group hover:border-slate-200 hover:bg-white transition-all"
          >
            {education.length > 1 && (
              <button
                onClick={() => onRemove(edu.id)}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Institution</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => onChange(edu.id, "institution", e.target.value)}
                  placeholder="e.g. Sorbonne University"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => onChange(edu.id, "degree", e.target.value)}
                  placeholder="e.g. Master of Computer Science"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                <input
                  type="text"
                  value={edu.duration}
                  onChange={(e) => onChange(edu.id, "duration", e.target.value)}
                  placeholder="e.g. 2018 - 2020"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => onChange(edu.id, "location", e.target.value)}
                  placeholder="e.g. Paris, France"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full py-4 border border-dashed border-sky-300 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-2 text-sky-600 hover:text-sky-700 bg-sky-50/20 hover:bg-sky-50/50 transition-all font-semibold text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Education
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
