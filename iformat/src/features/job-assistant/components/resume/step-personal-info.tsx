"use client";

import { User, Briefcase, Mail, Phone, MapPin, Globe, ChevronRight } from "lucide-react";
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

interface StepPersonalInfoProps {
  data: ResumeData;
  errors?: Record<string, string>;
  onChange: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  onNext: () => void;
}

export function StepPersonalInfo({ data, errors = {}, onChange, onNext }: StepPersonalInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step1"
      className="space-y-7"
    >
      <div className="flex items-center gap-3.5 pb-2 border-b border-slate-100">
        <div className="w-11 h-11 bg-sky-50 text-[#0A54B1] rounded-2xl border border-sky-100 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-[#0A54B1]" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Personal Information
          </h2>
          <p className="text-xs text-slate-500">
            Provide your contact details and professional title so recruiters know who you are.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.fullName ?? ""}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="e.g. Alex Morgan"
              className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                errors?.fullName
                  ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
              }`}
            />
          </div>
          {errors?.fullName && (
            <p className="text-[11px] font-semibold text-rose-500">{errors.fullName}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Target Job Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Briefcase className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.jobTitle ?? ""}
              onChange={(e) => onChange("jobTitle", e.target.value)}
              placeholder="e.g. Senior Product Designer"
              className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                errors?.jobTitle
                  ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
              }`}
            />
          </div>
          {errors?.jobTitle && (
            <p className="text-[11px] font-semibold text-rose-500">{errors.jobTitle}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Mail className="w-4 h-4" />
            </span>
            <input
              type="email"
              value={data?.email ?? ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="e.g. alex@example.com"
              className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                errors?.email
                  ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
              }`}
            />
          </div>
          {errors?.email && (
            <p className="text-[11px] font-semibold text-rose-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Phone Number <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Phone className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.phone ?? ""}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="e.g. +971 50 123 4567"
              className={`w-full h-11 pl-10 pr-3.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 shadow-2xs transition-all ${
                errors?.phone
                  ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
              }`}
            />
          </div>
          {errors?.phone && (
            <p className="text-[11px] font-semibold text-rose-500">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Location / City
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.location ?? ""}
              onChange={(e) => onChange("location", e.target.value)}
              placeholder="e.g. Dubai, UAE"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] shadow-2xs transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            LinkedIn Profile
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Linkedin className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.linkedin ?? ""}
              onChange={(e) => onChange("linkedin", e.target.value)}
              placeholder="e.g. linkedin.com/in/alexmorgan"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] shadow-2xs transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            Portfolio / Website
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
              <Globe className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={data?.website ?? ""}
              onChange={(e) => onChange("website", e.target.value)}
              placeholder="e.g. https://alexmorgan.design"
              className="w-full h-11 pl-10 pr-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] shadow-2xs transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center pt-5 border-t border-slate-100">
        <Button
          onClick={onNext}
          className="h-11 px-6 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
        >
          <span>Next: Professional Summary</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
