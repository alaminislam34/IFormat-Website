"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Check } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createJobSchema, CreateJobFormData } from "@/lib/validations/job.schema";
import { JobDTO } from "@/types/api";
import { useUpdateJob } from "@/hooks";
import { JobFormFields } from "./modal/job-form-fields";

interface EditJobModalProps {
  job: JobDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (job: JobDTO) => void;
}

export function EditJobModal({ job, isOpen, onClose, onUpdated }: EditJobModalProps) {
  const updateJobMutation = useUpdateJob();
  const [mounted, setMounted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);
  const [jobStatus, setJobStatus] = React.useState<"PUBLISHED" | "DRAFT" | "CLOSED">(
    (job?.status as any) || "PUBLISHED"
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      company: "",
      category: "",
      jobType: "Full Time",
      location: "Remote",
      salary: "",
      validity: "",
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
        company: job.company || (job as any).companyName || (job as any).employer?.companyName || "",
        category: job.category || "",
        jobType: (job.jobType as any) || "Full Time",
        location: (job.location as any) || "Remote",
        salary: job.salary || "",
        validity: job.validity
          ? new Date(job.validity).toISOString().split("T")[0]
          : "",
        description: job.description || "",
        requirements: requirementsStr,
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
        validity: data.validity ? new Date(data.validity).toISOString() : undefined,
        status: jobStatus,
        description: data.description.trim(),
        responsibilities: job.responsibilities || [],
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

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="edit-job-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          {/* Backdrop Click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          <m.div
            key="edit-job-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-8 max-h-[90vh] z-10"
          >
            {/* Header: Fixed at top */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-xs shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  Edit Job Opening
                </h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Update role specifications, requirements, and publishing status.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Container with fixed footer */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Form Content: Scrollable middle area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                {/* Status Switcher */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Publishing Status
                  </label>
                  <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
                    {(["PUBLISHED", "DRAFT", "CLOSED"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setJobStatus(st)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          jobStatus === st
                            ? "bg-white border-sky-100 text-sky-600 shadow-xs"
                            : "bg-transparent border-transparent text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <JobFormFields
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  selectedJobType={selectedJobType}
                  selectedLocation={selectedLocation}
                />
              </div>

              {/* Sticky Footer: Always visible, never scrolls away */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 h-11 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 h-11 bg-brand-gradient hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
