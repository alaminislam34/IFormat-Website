"use client";

import * as React from "react";
import { X, Sparkles, Loader2, Check } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createJobSchema, CreateJobFormData } from "@/lib/validations";
import { JobFormFields } from "./modal/job-form-fields";
import { JobAiAdvicePanel } from "./modal/job-ai-advice-panel";

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
              <JobFormFields
                register={register}
                errors={errors}
                setValue={setValue}
                selectedJobType={selectedJobType}
                selectedLocation={selectedLocation}
              />

              {/* AI Advice Panel */}
              <JobAiAdvicePanel show={showAiConsult} />

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
