"use client";

import React from "react";
import { User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ResumeData } from "../../types/resume.types";

interface StepPersonalInfoProps {
  data: ResumeData;
  onChange: <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => void;
  onNext: () => void;
}

export function StepPersonalInfo({ data, onChange, onNext }: StepPersonalInfoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step1"
      className="space-y-8"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
          <input
            type="text"
            value={data?.fullName ?? ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="e.g. MD Sifat Islam"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
          <input
            type="text"
            value={data?.jobTitle ?? ""}
            onChange={(e) => onChange("jobTitle", e.target.value)}
            placeholder="e.g. Senior Full Stack Developer"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
          <input
            type="email"
            value={data?.email ?? ""}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="e.g. sifat70640@gmail.com"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
          <input
            type="text"
            value={data?.phone ?? ""}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="e.g. +33 6 12 34 56 78"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
          <input
            type="text"
            value={data?.location ?? ""}
            onChange={(e) => onChange("location", e.target.value)}
            placeholder="e.g. Paris, France"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn URL</label>
          <input
            type="text"
            value={data?.linkedin ?? ""}
            onChange={(e) => onChange("linkedin", e.target.value)}
            placeholder="e.g. linkedin.com/in/johndoe"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Website</label>
          <input
            type="text"
            value={data?.website ?? ""}
            onChange={(e) => onChange("website", e.target.value)}
            placeholder="e.g. johndoe.com"
            className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
          />
        </div>
      </div>

      <div className="flex justify-end items-center pt-6 border-t border-slate-100">
        <Button onClick={onNext} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
