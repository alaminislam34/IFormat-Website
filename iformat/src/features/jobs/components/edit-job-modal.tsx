"use client";

import * as React from "react";
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
        validity: data.validity ? new Date(data.validity).toISOString() : undefined,
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

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 overflow-y-auto space-y-6 flex-1">
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
                selectedJobType={selectedJobType}
                selectedLocation={selectedLocation}
              />

              {/* Submit & Cancel Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
                  className="px-6 h-11 bg-brand-gradient hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs"
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
        </div>
      )}
    </AnimatePresence>
  );
}
