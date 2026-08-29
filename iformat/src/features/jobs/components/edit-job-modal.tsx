"use client";

import * as React from "react";
import { X, Loader2, Check } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createJobSchema, CreateJobFormData } from "@/lib/validations/job.schema";
import { JobDTO } from "@/types/api";
import { useUpdateJob } from "@/hooks";

interface EditJobModalProps {
  job: JobDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (job: JobDTO) => void;
}

const CATEGORIES = [
  "Technology & Engineering",
  "Design & Creative",
  "Business & Marketing",
  "Data & AI",
  "Finance & Operations",
  "Product & Management",
];

export function EditJobModal({ job, isOpen, onClose, onUpdated }: EditJobModalProps) {
  const updateJobMutation = useUpdateJob();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [jobStatus, setJobStatus] = React.useState<"PUBLISHED" | "DRAFT" | "CLOSED">(
    (job?.status as any) || "PUBLISHED"
  );

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

  React.useEffect(() => {
    if (job) {
      const requirementsStr = Array.isArray(job.requirements)
        ? job.requirements.join("\n")
        : typeof job.requirements === "string"
        ? job.requirements
        : "";

      const niceToHaveStr = Array.isArray(job.niceToHave)
        ? job.niceToHave.join("\n")
        : typeof job.niceToHave === "string"
        ? job.niceToHave
        : "";

      const perksStr = Array.isArray(job.perks)
        ? job.perks.join("\n")
        : typeof job.perks === "string"
        ? job.perks
        : "";

      reset({
        title: job.title || "",
        company: job.company || (job as any).companyName || "",
        category: job.category || "Technology & Engineering",
        jobType: (job.jobType as any) || "Full Time",
        location: (job.location as any) || "Remote",
        salary: job.salary || "Competitive",
        validity: job.validity
          ? new Date(job.validity).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        description: job.description || "",
        requirements: requirementsStr || "3+ years of experience\nStrong problem-solving skills",
        niceToHave: niceToHaveStr,
        perks: perksStr,
      });

      setJobStatus((job.status as any) || "PUBLISHED");
    }
  }, [job, reset]);

  if (!job) return null;

  const onFormSubmit = async (data: CreateJobFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        title: data.title.trim(),
        company: data.company.trim(),
        category: data.category,
        jobType: data.jobType,
        location: data.location,
        salary: data.salary.trim() ? data.salary : "Competitive",
        status: jobStatus,
        description: data.description.trim(),
        requirements: data.requirements
          .split("\n")
          .map((r) => r.trim())
          .filter(Boolean),
        niceToHave: data.niceToHave
          ? data.niceToHave
              .split("\n")
              .map((n) => n.trim())
              .filter(Boolean)
          : [],
        perks: data.perks
          ? data.perks
              .split("\n")
              .map((p) => p.trim())
              .filter(Boolean)
          : [],
      };

      const updated = await updateJobMutation.mutateAsync({
        id: job.id,
        payload,
      });

      toast.success(`Job "${data.title}" updated successfully!`);
      onUpdated?.(updated);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update job posting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <m.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8 max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div>
                <h3 className="text-xl font-black text-slate-900">Edit Job Posting</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update role specifications, requirements, and publishing status.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Status Switcher */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800">Job Status</span>
                  <p className="text-[11px] text-slate-500">
                    Control visibility on the public job portal.
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                  {(["PUBLISHED", "DRAFT", "CLOSED"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setJobStatus(st)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                        jobStatus === st
                          ? st === "PUBLISHED"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : st === "CLOSED"
                            ? "bg-rose-600 text-white shadow-xs"
                            : "bg-amber-500 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      {st === "PUBLISHED" ? "Active" : st === "CLOSED" ? "Closed" : "Draft"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("title")}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all",
                      errors.title ? "border-rose-300 bg-rose-50/30" : "border-slate-200"
                    )}
                  />
                  {errors.title && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("company")}
                    className={cn(
                      "w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all",
                      errors.company ? "border-rose-300 bg-rose-50/30" : "border-slate-200"
                    )}
                  />
                  {errors.company && (
                    <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.company.message}</p>
                  )}
                </div>
              </div>

              {/* Category & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry Category</label>
                  <select
                    {...register("category")}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Salary Range</label>
                  <input
                    type="text"
                    {...register("salary")}
                    placeholder="e.g. $120,000 - $150,000 / year"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all"
                  />
                </div>
              </div>

              {/* Job Type & Workplace Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Employment Type</label>
                  <div className="flex gap-2">
                    {["Full Time", "Part Time", "Contract"].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue("jobType", type as any)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          selectedJobType === type
                            ? "bg-[#0A54B1] text-white border-[#0A54B1] shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Workplace Policy</label>
                  <div className="flex gap-2">
                    {["Remote", "Onsite", "Hybrid"].map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => setValue("location", loc as any)}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                          selectedLocation === loc
                            ? "bg-[#0A54B1] text-white border-[#0A54B1] shadow-xs"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Job Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  {...register("description")}
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none",
                    errors.description ? "border-rose-300 bg-rose-50/30" : "border-slate-200"
                  )}
                />
                {errors.description && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Requirements (One per line) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  {...register("requirements")}
                  placeholder="3+ years of experience with React & TypeScript&#10;Strong understanding of REST APIs&#10;Excellent communication skills"
                  className={cn(
                    "w-full px-3.5 py-2.5 rounded-xl border bg-slate-50/50 text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] transition-all resize-none",
                    errors.requirements ? "border-rose-300 bg-rose-50/30" : "border-slate-200"
                  )}
                />
                {errors.requirements && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.requirements.message}</p>
                )}
              </div>

              {/* Nice to Have & Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nice to Have (Optional)</label>
                  <textarea
                    rows={2}
                    {...register("niceToHave")}
                    placeholder="Experience with AWS/GCP&#10;Next.js familiarity"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Benefits & Perks (Optional)</label>
                  <textarea
                    rows={2}
                    {...register("perks")}
                    placeholder="Flexible PTO&#10;Health & Dental Coverage"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white text-xs font-extrabold shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
}
