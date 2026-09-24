"use client";

import React from "react";
import { Award, Sparkles, Layers, Link2, Languages, Heart, Plus, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepSkillsMoreProps {
  data: ResumeData;
  errors?: Record<string, string>;
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
  errors = {},
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
        <div className="w-10 h-10 bg-blue-50 text-[#0A54B1] rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Skills & Additional Details <span className="text-rose-500">*</span>
          </h2>
          <p className="text-xs text-slate-500">
            Organize your technical proficiencies, professional certifications, and spoken languages.
          </p>
        </div>
      </div>

      {errors?.skillGroups && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
          <span>{errors.skillGroups}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Skill groups */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0A54B1]" />
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Skill Groups <span className="text-rose-500">*</span>
              </label>
            </div>
            <span className="text-[11px] text-slate-400">e.g. Frontend: React, Next.js</span>
          </div>

          <div className="space-y-3">
            {data.skillGroups.map((group) => {
              const itemError = errors?.[`skill_${group.id}`];
              return (
                <div key={group.id} className="space-y-1">
                  <div className="flex gap-2 sm:gap-3 items-center">
                    <input
                      type="text"
                      value={group.category ?? ""}
                      onChange={(e) => onSkillGroupChange(group.id, "category", e.target.value)}
                      placeholder="Category (e.g. Languages)"
                      className={`w-1/3 min-w-28 h-11 px-3 sm:px-4 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                        itemError
                          ? "border-rose-300 bg-rose-50/15 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                      }`}
                    />
                    <input
                      type="text"
                      value={group.skills ?? ""}
                      onChange={(e) => onSkillGroupChange(group.id, "skills", e.target.value)}
                      placeholder="TypeScript, Python, Go, SQL"
                      className={`flex-1 h-11 px-3 sm:px-4 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition-all ${
                        itemError
                          ? "border-rose-300 bg-rose-50/15 focus:ring-rose-500/20 focus:border-rose-500"
                          : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                      }`}
                    />
                    {data.skillGroups.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onRemoveSkillGroup(group.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                        title="Remove Skill Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {itemError && (
                    <p className="text-[11px] font-medium text-rose-500 pl-1">{itemError}</p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onAddSkillGroup}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A54B1] bg-blue-50/80 hover:bg-blue-100/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Skill Group
          </button>
        </div>

        {/* Certifications */}
        <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#0A54B1]" />
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Certifications & Accreditations
              </label>
            </div>
            <span className="text-[11px] text-slate-400">Optional</span>
          </div>

          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex gap-2 sm:gap-3 items-center">
                <input
                  type="text"
                  value={cert.name ?? ""}
                  onChange={(e) => onCertChange(cert.id, "name", e.target.value)}
                  placeholder="e.g. AWS Certified Solutions Architect"
                  className="w-1/2 h-11 px-3 sm:px-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                />
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={cert.link ?? ""}
                    onChange={(e) => onCertChange(cert.id, "link", e.target.value)}
                    placeholder="https://..."
                    className="w-full h-11 pl-10 pr-3 sm:pr-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveCert(cert.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove Certification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onAddCert}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0A54B1] bg-blue-50/80 hover:bg-blue-100/80 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-[#0A54B1]" />
              <label className="text-xs font-bold text-slate-700">Languages</label>
            </div>
            <textarea
              rows={3}
              value={data?.languages ?? ""}
              onChange={(e) => onChange("languages", e.target.value)}
              placeholder="e.g. English (Native), French (Fluent), German (Conversational)"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#0A54B1]" />
              <label className="text-xs font-bold text-slate-700">Interests & Hobbies</label>
            </div>
            <textarea
              rows={3}
              value={data?.interests ?? ""}
              onChange={(e) => onChange("interests", e.target.value)}
              placeholder="e.g. Open Source, Cloud Architecture, Marathon Running, Chess"
              className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700 cursor-pointer">
          Previous
        </Button>
        <Button
          onClick={onGenerate}
          className="bg-brand-gradient text-white hover:opacity-95 px-8 h-11 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" /> GENERATE CV / RESUME
        </Button>
      </div>
    </motion.div>
  );
}
