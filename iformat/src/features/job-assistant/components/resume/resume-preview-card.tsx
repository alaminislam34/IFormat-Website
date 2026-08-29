"use client";

import React from "react";
import { ArrowLeft, Save, Copy, Printer, Loader2, Mail, Phone, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ResumePreviewCardProps {
  data: ResumeData;
  activeCvId: string | null;
  activeVersionNumber: number;
  isSaving: boolean;
  copied: boolean;
  onEdit: () => void;
  onSaveToCloud: () => void;
  onCopy: () => void;
  onPrint: () => void;
}

export function ResumePreviewCard({
  data,
  activeCvId,
  activeVersionNumber,
  isSaving,
  copied,
  onEdit,
  onSaveToCloud,
  onCopy,
  onPrint,
}: ResumePreviewCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      key="step6"
      className="lg:col-span-7 space-y-8"
    >
      {/* Preview Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
        <button
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Edit Details
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            onClick={onSaveToCloud}
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-500 h-10 px-4 rounded-xl text-white flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                {activeCvId ? `Save Version (v${activeVersionNumber + 1})` : "Save to Cloud"}
              </>
            )}
          </Button>
          <Button
            onClick={onCopy}
            variant="outline"
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? "Copied!" : "Copy Text"}
          </Button>
          <Button
            onClick={onPrint}
            className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 h-10 px-4 rounded-xl text-white flex items-center gap-2 text-xs font-semibold shadow-sm cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" /> Print / PDF
          </Button>
        </div>
      </div>

      {/* Print area / CV Template */}
      <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-inner bg-slate-100/50 p-4 md:p-8 flex justify-center">
        <div className="bg-white w-full max-w-200 shadow-lg rounded-xl border border-slate-200 p-8 md:p-12 space-y-8 text-slate-800 text-left font-sans select-text print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="border-b-2 border-slate-100 pb-6 space-y-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.fullName || "Your Full Name"}</h1>
            <h2 className="text-lg font-bold text-[#0A54B1]">{data.jobTitle || "Job Title"}</h2>

            {/* Contacts bar */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-500">
              {data.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {data.email}
                </span>
              )}
              {data.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {data.phone}
                </span>
              )}
              {data.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {data.location}
                </span>
              )}
              {data.website && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-400" /> {data.website}
                </span>
              )}
              {data.linkedin && (
                <span className="flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-slate-400" /> {data.linkedin}
                </span>
              )}
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Professional Summary</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.workExperience.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Professional Experience</h3>
              <div className="space-y-6">
                {data.workExperience.map((work) => (
                  <div key={work.id} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm font-bold">
                      <span className="text-slate-800 font-extrabold">{work.role || "Job Role"}</span>
                      <span className="text-slate-500 font-semibold text-xs">{work.duration}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-500">
                      <span className="text-[#0A54B1] font-bold">{work.company || "Company Name"}</span>
                      <span>{work.location}</span>
                    </div>
                    {work.description && (
                      <ul className="list-disc list-inside pl-2 space-y-1">
                        {work.description.split("\n").map((line, idx) => (
                          <li key={idx} className="text-slate-600 text-xs leading-relaxed font-medium">
                            {line}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Education</h3>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm font-bold">
                      <span className="text-slate-800 font-extrabold">{edu.degree || "Degree"}</span>
                      <span className="text-slate-500 font-semibold text-xs">{edu.duration}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-500">
                      <span className="text-[#0A54B1] font-bold">{edu.institution || "Institution"}</span>
                      <span>{edu.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skillGroups.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Skills</h3>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {data.skillGroups.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <span className="font-extrabold text-slate-800">{group.category || "Category"}:</span>
                    <span className="text-slate-600 leading-relaxed font-medium ml-1">{group.skills || "Skills listed"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications, Languages, Interests */}
          <div className="grid sm:grid-cols-2 gap-6 pt-2">
            {data.certifications.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Certifications</h3>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  {data.certifications.map((cert) => (
                    <li key={cert.id} className="text-slate-600 font-medium">
                      {cert.link ? (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A54B1] hover:underline">
                          {cert.name}
                        </a>
                      ) : (
                        cert.name
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              {data.languages && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Languages</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">{data.languages}</p>
                </div>
              )}
              {data.interests && (
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Interests</h3>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">{data.interests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
