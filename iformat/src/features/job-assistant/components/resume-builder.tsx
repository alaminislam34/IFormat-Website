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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {steps.map((s) => (
              <button
                key={s.num}
                onClick={() => setStep(s.num)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  step === s.num
                    ? "bg-[#0A54B1] text-white shadow-md shadow-blue-500/20"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsConsultModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Consult with expert
          </button>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-100/50 p-6 md:p-10 relative overflow-hidden">
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
                onChange={handleInputChange}
                onNext={() => setStep(2)}
              />
            )}

            {step === 2 && (
              <StepSummary
                summary={data.summary}
                onChange={(val) => handleInputChange("summary", val)}
                onPrev={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}

            {step === 3 && (
              <StepWorkExperience
                workExperience={data.workExperience}
                onChange={handleWorkChange}
                onAdd={addWork}
                onRemove={removeWork}
                onPrev={() => setStep(2)}
                onNext={() => setStep(4)}
              />
            )}

            {step === 4 && (
              <StepEducation
                education={data.education}
                onChange={handleEduChange}
                onAdd={addEdu}
                onRemove={removeEdu}
                onPrev={() => setStep(3)}
                onNext={() => setStep(5)}
              />
            )}

            {step === 5 && (
              <StepSkillsMore
                data={data}
                onChange={handleInputChange}
                onSkillGroupChange={handleSkillGroupChange}
                onAddSkillGroup={addSkillGroup}
                onRemoveSkillGroup={removeSkillGroup}
                onCertChange={handleCertChange}
                onAddCert={addCert}
                onRemoveCert={removeCert}
                onPrev={() => setStep(4)}
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
