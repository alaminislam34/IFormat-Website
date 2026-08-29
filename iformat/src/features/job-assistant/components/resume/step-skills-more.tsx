"use client";

import React from "react";
import { Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepSkillsMoreProps {
  data: ResumeData;
  onChange: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  onSkillGroupChange: (id: string, field: string, value: string) => void;
  onAddSkillGroup: () => void;
  onRemoveSkillGroup: (id: string) => void;
  onCertChange: (id: string, field: string, value: string) => void;
  onAddCert: () => void;
  onRemoveCert: (id: string) => void;
  onPrev: () => void;
  onGenerate: () => void;
}

export function StepSkillsMore({
  data,
  onChange,
  onSkillGroupChange,
  onAddSkillGroup,
  onRemoveSkillGroup,
  onCertChange,
  onAddCert,
  onRemoveCert,
  onPrev,
  onGenerate,
}: StepSkillsMoreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step5"
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Skills & More</h2>
      </div>

      <div className="space-y-6">
        {/* Skill groups */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Skill Groups (e.g. Frontend: React, Next.js)
          </label>
          <div className="space-y-3">
            {data.skillGroups.map((group) => (
              <div key={group.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={group.category}
                  onChange={(e) => onSkillGroupChange(group.id, "category", e.target.value)}
                  placeholder="Group name (e.g. Frontend)"
                  className="w-1/3 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                />
                <input
                  type="text"
                  value={group.skills}
                  onChange={(e) => onSkillGroupChange(group.id, "skills", e.target.value)}
                  placeholder="React, Next.js, HTML, CSS"
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                />
                <button
                  onClick={() => onRemoveSkillGroup(group.id)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onAddSkillGroup}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A54B1] hover:underline cursor-pointer"
          >
            + Add Group
          </button>
        </div>

        {/* Certifications */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certifications</label>
          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex gap-3 items-center">
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => onCertChange(cert.id, "name", e.target.value)}
                  placeholder="Certificate Name"
                  className="w-1/2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                />
                <input
                  type="text"
                  value={cert.link}
                  onChange={(e) => onCertChange(cert.id, "link", e.target.value)}
                  placeholder="Verification Link"
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                />
                <button
                  onClick={() => onRemoveCert(cert.id)}
                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onAddCert}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A54B1] hover:underline cursor-pointer"
          >
            + Add Certification
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages (e.g. English: Native, French: B2)</label>
            <textarea
              rows={3}
              value={data.languages}
              onChange={(e) => onChange("languages", e.target.value)}
              placeholder="e.g. English: Fluent, Spanish: Conversational"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interests</label>
            <textarea
              rows={3}
              value={data.interests}
              onChange={(e) => onChange("interests", e.target.value)}
              placeholder="e.g. Open Source, Hiking, Design Systems"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
          Previous
        </Button>
        <Button
          onClick={onGenerate}
          className="bg-brand-gradient text-white hover:opacity-95 px-8 h-11 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> GENERATE CV/RESUME
        </Button>
      </div>
    </motion.div>
  );
}
