"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

import { useResumeState } from "../hooks/use-resume-state";
import { CloudCvToolbar } from "./resume/cloud-cv-toolbar";
import { SavedResumesModal } from "./resume/saved-resumes-modal";
import { StepPersonalInfo } from "./resume/step-personal-info";
import { StepSummary } from "./resume/step-summary";
import { StepWorkExperience } from "./resume/step-work-experience";
import { StepEducation } from "./resume/step-education";
import { StepSkillsMore } from "./resume/step-skills-more";
import { ResumePreviewCard } from "./resume/resume-preview-card";

const steps = [
  { num: 1, label: "01. Personal Info" },
  { num: 2, label: "02. Summary" },
  { num: 3, label: "03. Work Experience" },
  { num: 4, label: "04. Education" },
  { num: 5, label: "05. Skills & More" },
];

export function ResumeBuilder() {
  const [isConsultModalOpen, setIsConsultModalOpen] = React.useState(false);

  const {
    step,
    setStep,
    errors,
    data,
    isGenerating,
    copied,
    isAuthenticated,
    userCVs,
    loadingCVs,
    activeCvId,
    activeCvTitle,
    activeVersionNumber,
    savedModalOpen,
    setSavedModalOpen,
    showAuthModal,
    setShowAuthModal,
    showUpgradeModal,
    setShowUpgradeModal,
    isSaving,
    goToNextStep,
    goToPrevStep,
    goToStep,
    handleSaveToCloud,
    handleLoadCV,
    handleNewResume,
    handleDeleteCV,
    handleInputChange,
    handleWorkChange,
    addWork,
    removeWork,
    handleEduChange,
    addEdu,
    removeEdu,
    handleSkillGroupChange,
    addSkillGroup,
    removeSkillGroup,
    handleCertChange,
    addCert,
    removeCert,
    handleGenerate,
    handleDemoGenerate,
    handlePrint,
    handleCopy,
  } = useResumeState();

  return (
    <div className="w-full">
      {/* Consultation Modal */}
      <BookConsultationModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        serviceTitle="1-on-1 CV & Career Brand Consultation"
      />

      {/* Cloud CV Toolbar */}
      <CloudCvToolbar
        isAuthenticated={isAuthenticated}
        activeCvId={activeCvId}
        activeCvTitle={activeCvTitle}
        activeVersionNumber={activeVersionNumber}
        totalCVsCount={userCVs?.length || 0}
        isSaving={isSaving}
        onSaveToCloud={handleSaveToCloud}
        onOpenSavedModal={() => setSavedModalOpen(true)}
      />

      {/* Steps Selector & Consult with expert button */}
      {step <= 5 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 mb-6 shadow-xs flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 print:hidden no-print">
          {/* Stepper progress track */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 xl:pb-0">
            {steps.map((s) => {
              const isCurrent = step === s.num;
              const isCompleted = step > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => goToStep(s.num)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isCurrent
                      ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/20"
                      : isCompleted
                      ? "bg-sky-50 text-[#0A54B1] hover:bg-sky-100/70 border border-sky-100"
                      : "bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                      isCurrent
                        ? "bg-white text-[#0A54B1]"
                        : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {isCompleted ? "✓" : s.num}
                  </span>
                  <span>{s.label.replace(/^\d+\.\s*/, "")}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between xl:justify-end gap-3 pt-2 xl:pt-0 border-t xl:border-t-0 border-slate-100 shrink-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Step {step} of 5
            </span>
            <button
              type="button"
              onClick={() => setIsConsultModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Consult Expert</span>
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50 p-6 md:p-10 relative overflow-hidden print:p-0 print:m-0 print:border-none print:shadow-none print:bg-transparent print:overflow-visible">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-[#0A54B1] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
              <Sparkles className="w-8 h-8 text-[#0A54B1] absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">AI is Writing Your CV...</h3>
              <p className="text-sm text-slate-500 max-w-xs mx-auto">
                Analyzing your qualifications, optimizing for ATS systems, and polishing your layout.
              </p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {step === 1 && (
              <StepPersonalInfo
                data={data}
                errors={errors}
                onChange={handleInputChange}
                onNext={goToNextStep}
              />
            )}

            {step === 2 && (
              <StepSummary
                summary={data.summary}
                errors={errors}
                onChange={(val) => handleInputChange("summary", val)}
                onPrev={goToPrevStep}
                onNext={goToNextStep}
              />
            )}

            {step === 3 && (
              <StepWorkExperience
                workExperience={data.workExperience}
                errors={errors}
                onChange={handleWorkChange}
                onAdd={addWork}
                onRemove={removeWork}
                onPrev={goToPrevStep}
                onNext={goToNextStep}
              />
            )}

            {step === 4 && (
              <StepEducation
                education={data.education}
                errors={errors}
                onChange={handleEduChange}
                onAdd={addEdu}
                onRemove={removeEdu}
                onPrev={goToPrevStep}
                onNext={goToNextStep}
              />
            )}

            {step === 5 && (
              <StepSkillsMore
                data={data}
                errors={errors}
                onChange={handleInputChange}
                onSkillGroupChange={handleSkillGroupChange}
                onAddSkillGroup={addSkillGroup}
                onRemoveSkillGroup={removeSkillGroup}
                onCertChange={handleCertChange}
                onAddCert={addCert}
                onRemoveCert={removeCert}
                onPrev={goToPrevStep}
                onGenerate={handleGenerate}
              />
            )}

            {step === 6 && (
              <ResumePreviewCard
                data={data}
                activeCvId={activeCvId}
                activeVersionNumber={activeVersionNumber}
                isSaving={isSaving}
                copied={copied}
                onEdit={() => setStep(1)}
                onSaveToCloud={handleSaveToCloud}
                onCopy={handleCopy}
                onPrint={handlePrint}
              />
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Cloud Resumes Modal */}
      <SavedResumesModal
        isOpen={savedModalOpen}
        userCVs={userCVs || []}
        loadingCVs={loadingCVs}
        activeCvId={activeCvId}
        onClose={() => setSavedModalOpen(false)}
        onLoadCV={handleLoadCV}
        onNewResume={handleNewResume}
        onDeleteCV={handleDeleteCV}
      />

      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onContinueGuest={handleDemoGenerate}
        title="Sign in to save your resume"
        description="Create an account or sign in to save multiple resume versions and access AI generation."
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Pro for Unlimited Resume AI"
        message="You have reached the monthly AI generation limit on your current plan. Upgrade to generate unlimited tailored resumes."
      />
    </div>
  );
}
