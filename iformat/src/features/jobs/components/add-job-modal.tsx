"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Loader2, Check } from "lucide-react";
import { motion as m, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createJobSchema, CreateJobFormData } from "@/lib/validations";
import { JobFormFields } from "./modal/job-form-fields";
import { JobAiAdvicePanel } from "./modal/job-ai-advice-panel";

import { useAuthStore } from "@/stores/use-auth-store";
import { UpgradePlanModal } from "@/features/billing/components/upgrade-plan-modal";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: any) => Promise<void> | void;
}

export function AddJobModal({ isOpen, onClose, onSubmit }: AddJobModalProps) {
  const { user } = useAuthStore();
  const [mounted, setMounted] = React.useState(false);
  const [showAiConsult, setShowAiConsult] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [limitDetails, setLimitDetails] = React.useState<{
    currentLimit: number;
    activeCount: number;
  }>({ currentLimit: 1, activeCount: 1 });

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
      company: user?.companyName || user?.name || "",
      category: "Technology & Engineering",
      jobType: "Full Time",
      location: "Remote",
      salary: "$100,000 - $130,000",
      validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      description: "",
      requirements: "",
      niceToHave: "",
      perks: "",
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        company: user?.companyName || user?.name || "",
        category: "Technology & Engineering",
        jobType: "Full Time",
        location: "Remote",
        salary: "$100,000 - $130,000",
        validity: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        description: "",
        requirements: "",
        niceToHave: "",
        perks: "",
      });
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, user, reset]);

  const selectedJobType = useWatch({ control, name: "jobType" });
  const selectedLocation = useWatch({ control, name: "location" });

  const onFormSubmit = async (data: CreateJobFormData) => {
    try {
      setIsSubmitting(true);

      const validityDate = data.validity
        ? new Date(data.validity).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      await onSubmit({
        title: data.title.trim(),
        company: data.company.trim() || user?.companyName || "iFormat Partner",
        category: data.category,
        jobType: data.jobType,
        location: data.location,
        salary: data.salary.trim() ? data.salary : "Competitive",
        validity: validityDate,
        status: "PUBLISHED",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        description: data.description.trim(),
        responsibilities: [],
        requirements: data.requirements.trim()
          ? data.requirements.split("\n").map((r) => r.trim()).filter(Boolean)
          : [],
        niceToHave: data.niceToHave?.trim()
          ? data.niceToHave.split("\n").map((n) => n.trim()).filter(Boolean)
          : [],
        perks: data.perks?.trim()
          ? data.perks.split("\n").map((p) => p.trim()).filter(Boolean)
          : [],
      });

      setIsSuccess(true);
      setTimeout(() => {
        reset();
        setIsSuccess(false);
        onClose();
      }, 300);
    } catch (err: any) {
      const errMsg = (err?.message || "").toLowerCase();
      const errCode = err?.code || "";
      const isLimitError =
        errCode === "SUBSCRIPTION_REQUIRED" ||
        (err?.statusCode === 403 &&
          (errMsg.includes("limit") ||
            errMsg.includes("upgrade") ||
            errMsg.includes("posting"))) ||
        errMsg.includes("reached your limit") ||
        errMsg.includes("active job posting") ||
        errMsg.includes("upgrade to post");

      if (isLimitError) {
        const payloadData = err?.data || err?.errors || {};
        setLimitDetails({
          currentLimit: payloadData?.maxAllowed ?? 1,
          activeCount: payloadData?.currentActiveJobs ?? 1,
        });
        setShowUpgradeModal(true);
      } else {
        toast.error(err?.message || "Failed to post job. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <m.div
          key="add-job-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
        >
          {/* Backdrop Click-away */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Card */}
          <m.div
            key="add-job-card"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-100 z-10"
          >
            {/* Header: Fixed at top */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 backdrop-blur-xs shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">Post a New Job</h2>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Fill in the details to publish your job listing</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Container with fixed footer */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Form Content: Scrollable middle area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
                <JobFormFields
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  watch={watch}
                  selectedJobType={selectedJobType}
                  selectedLocation={selectedLocation}
                />

                {/* AI Advice Panel */}
                <JobAiAdvicePanel show={showAiConsult} />
              </div>

              {/* Bottom Footer: Always visible, never scrolls away */}
              <div className="p-4 sm:p-5 border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.03)] space-y-3">
                <div className="flex items-center justify-between gap-3">
                  {/* AI Advice consultation toggle */}
                  <button
                    type="button"
                    onClick={() => setShowAiConsult(!showAiConsult)}
                    className="h-11 px-3.5 bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold rounded-xl border border-sky-100 flex items-center gap-1.5 transition-colors cursor-pointer text-xs shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span className="hidden sm:inline">{showAiConsult ? "Hide AI Tips" : "AI Optimization Tips"}</span>
                    <span className="sm:hidden">AI Tips</span>
                  </button>

                  {/* Actions: Cancel & Post Job */}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-11 px-4 sm:px-5 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || isSuccess}
                      className="h-11 px-5 sm:px-6 bg-brand-gradient hover:opacity-95 text-white font-bold rounded-xl shadow-lg shadow-blue-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer text-xs disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isSuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <span>Post Job</span>
                      )}
                      <span>{isSubmitting ? "Publishing..." : isSuccess ? "Published!" : ""}</span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentLimit={limitDetails.currentLimit}
        activeCount={limitDetails.activeCount}
        onUpgrade={() => {
          setShowUpgradeModal(false);
          onClose();
        }}
      />
    </>
  );
}
