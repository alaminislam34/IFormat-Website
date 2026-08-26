"use client";

import * as React from "react";
import { X, Calendar, Sparkles, AlertCircle, Loader2, Check } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Job } from "./job-card";
import { cn } from "@/lib/utils";
import { createJobSchema, CreateJobFormData } from "@/lib/validations";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: any) => Promise<void> | void;
}

export function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const [showAiConsult, setShowAiConsult] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      company: "",
      category: "Technology & Engineering",
      jobType: "Full Time",
      location: "Remote",
      salary: "$100,000 - $130,000",
      validity: new Date().toISOString().split("T")[0],
      description: "",
      requirements: "",
      niceToHave: "",
      perks: "",
    },
  });

  const selectedJobType = useWatch({ control, name: "jobType" });
  const selectedLocation = useWatch({ control, name: "location" });

  const onFormSubmit = async (data: CreateJobFormData) => {
    try {
      setIsSubmitting(true);

      await onSubmit({
        title: data.title,
        company: data.company,
        category: data.category,
        jobType: data.jobType,
        location: data.location,
        salary: data.salary.trim() ? data.salary : "Competitive",
        status: "PUBLISHED",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        description: data.description,
        responsibilities: [
          "Contribute to the team's core goals and roadmap items",
          "Collaborate cross-functionally to implement new features",
          "Maintain high-quality standards through peer code reviews",
        ],
        requirements: data.requirements.trim()
          ? data.requirements.split("\n").filter((r) => r.trim() !== "")
          : ["3+ years of relevant industry experience", "Strong communication skills"],
        niceToHave: data.niceToHave?.trim()
          ? data.niceToHave.split("\n").filter((n) => n.trim() !== "")
          : ["Experience with modern cloud platforms"],
        perks: data.perks?.trim()
          ? data.perks.split("\n").filter((p) => p.trim() !== "")
          : ["Competitive salary", "Remote-first culture", "Flexible PTO"],
      });

      setIsSuccess(true);
      toast.success("Job posted successfully to database!");

      setTimeout(() => {
        reset();
        setIsSuccess(false);
        onClose();
      }, 500);
    } catch (err: any) {
      toast.error(err.message || "Failed to post job. Please ensure you are logged in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="add-job-modal-container" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Overlay */}
          <m.div
            key="add-job-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <m.div
            key="add-job-card"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            data-lenis-prevent
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 z-10"
          >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Post a New Job</h2>
              <p className="text-xs font-semibold text-slate-500 mt-1">Fill in the details to publish your job listing</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
            
            {/* Job Title */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Full Stack Developer"
                {...register("title")}
                className={cn(
                  "w-full h-11 px-4 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
                  errors.title
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
                )}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.title.message}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Company Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Corp"
                {...register("company")}
                className={cn(
                  "w-full h-11 px-4 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all",
                  errors.company
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
                )}
              />
              {errors.company && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.company.message}
                </p>
              )}
            </div>

            {/* Industry/Category */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Industry / Category
                </label>
                <select
                  {...register("category")}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all cursor-pointer"
                >
                  <option>Technology & Engineering</option>
                  <option>Design & Creative</option>
                  <option>Business & Marketing</option>
                  <option>Data & AI</option>
                </select>
              </div>

              {/* Salary Range */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Salary Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. $80,000 - $100,000"
                  {...register("salary")}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all"
                />
              </div>
            </div>

            {/* Job Type & Work Location */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Job Type */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Job Type
                </label>
                <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                  {(["Full Time", "Part Time", "Contract"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue("jobType", type)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer focus:outline-none",
                        selectedJobType === type
                          ? "bg-white border-sky-100 text-sky-600 shadow-xs"
                          : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Work Location */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Work Location
                </label>
                <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                  {(["Remote", "Onsite", "Hybrid"] as const).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setValue("location", loc)}
                      className={cn(
                        "flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer focus:outline-none",
                        selectedLocation === loc
                          ? "bg-white border-sky-100 text-sky-600 shadow-xs"
                          : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Job Validity */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Job Validity <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  {...register("validity")}
                  className={cn(
                    "w-full h-11 px-4 pr-10 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer",
                    errors.validity
                      ? "border-rose-300 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
                  )}
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {errors.validity && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.validity.message}
                </p>
              )}
            </div>

            {/* Job Description */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Job Description / About the Role <span className="text-rose-500">*</span>
              </label>
              <textarea
                placeholder="Describe the role, team, and what the candidate will work on..."
                rows={3}
                {...register("description")}
                className={cn(
                  "w-full px-4 py-3 rounded-xl border bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all resize-none",
                  errors.description
                    ? "border-rose-300 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-sky-100 focus:border-sky-500"
                )}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.description.message}
                </p>
              )}
            </div>

            {/* Requirements (One per line) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Requirements <span className="text-slate-400">(one per line)</span>
              </label>
              <textarea
                placeholder="4+ years of experience in React&#10;Proficiency in Node.js&#10;Strong communication skills"
                rows={3}
                {...register("requirements")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
              />
            </div>

            {/* Nice to have (One per line) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Nice To Have <span className="text-slate-400">(one per line)</span>
              </label>
              <textarea
                placeholder="Open-source contributions&#10;Relevant certifications"
                rows={2}
                {...register("niceToHave")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
              />
            </div>

            {/* Benefits & Perks (One per line) */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Benefits & Perks <span className="text-slate-400">(one per line)</span>
              </label>
              <textarea
                placeholder="Competitive salary&#10;Remote-first&#10;Unlimited PTO"
                rows={2}
                {...register("perks")}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 transition-all resize-none"
              />
            </div>

            {/* AI Advisor Panel */}
            {showAiConsult && (
              <m.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-sky-100 bg-[#f0f7fa] rounded-2xl p-4 space-y-2.5 mt-2"
              >
                <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-sky-500 animate-pulse" /> iFormat AI Optimization Tips
                </div>
                <ul className="text-xs text-slate-600 space-y-2 font-medium">
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-500 font-bold">•</span>
                    <span><strong>Structure:</strong> Start with a strong 1-sentence hook explaining why this role is crucial to the company&apos;s growth.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-500 font-bold">•</span>
                    <span><strong>Keywords:</strong> Use industry-standard terms to maximize compatibility with applicant tracking systems (ATS).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-sky-500 font-bold">•</span>
                    <span><strong>Action Verbs:</strong> Rather than saying &quot;Responsible for&quot;, use words like &quot;Pioneer&quot;, &quot;Architect&quot;, &quot;Lead&quot;, and &quot;Deliver&quot;.</span>
                  </li>
                </ul>
              </m.div>
            )}

            {/* Submit & Cancel Buttons */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-12 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess}
                  className="h-12 bg-brand-gradient hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSuccess ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span>+ Post Job</span>
                  )}
                  <span>{isSubmitting ? "Publishing..." : isSuccess ? "Published!" : ""}</span>
                </button>
              </div>

              {/* Consultation helper button */}
              <button
                type="button"
                onClick={() => setShowAiConsult(!showAiConsult)}
                className="w-full h-12 bg-linear-to-r from-sky-600 to-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition-opacity cursor-pointer text-sm shadow-md"
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span>Consult with an expert to improve my job post</span>
              </button>
            </div>

          </form>
        </m.div>
      </div>
      )}
    </AnimatePresence>
  );
}
