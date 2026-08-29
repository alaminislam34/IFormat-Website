"use client";

import * as React from "react";
import Link from "next/link";
import { User, FileText, Briefcase, GraduationCap, Award, Sparkles } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

import { useResumeState } from "../hooks/use-resume-state";
import { CloudCvToolbar } from "./resume/cloud-cv-toolbar";
import { SavedResumesModal } from "./resume/saved-resumes-modal";
import { StepPersonalInfo } from "./resume/step-personal-info";
import { StepSummary } from "./resume/step-summary";
import { StepWorkExperience } from "./resume/step-work-experience";
import { StepEducation } from "./resume/step-education";
import { StepSkillsMore } from "./resume/step-skills-more";
import { ResumePreviewCard } from "./resume/resume-preview-card";

export function ResumeBuilder() {
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
    handlePrint,
    handleCopy,
  } = useResumeState();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Form: 5 Cols */}
      <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Cloud Persistence Toolbar */}
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

        {/* Step Indicator Tabs */}
        <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl">
          {[
            { id: 1, icon: User, label: "Info" },
            { id: 2, icon: FileText, label: "Summary" },
            { id: 3, icon: Briefcase, label: "Work" },
            { id: 4, icon: GraduationCap, label: "Edu" },
            { id: 5, icon: Award, label: "Skills" },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition-all cursor-pointer ${
                step === s.id
                  ? "bg-white text-sky-600 font-bold shadow-xs border border-sky-100"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <s.icon className={`w-4 h-4 mb-1 ${step === s.id ? "text-sky-600" : "text-slate-400"}`} />
              <span className="text-[10px] tracking-tight">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step Form Switcher */}
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
        </AnimatePresence>

        {/* Pro Banner */}
        <div className="p-4 bg-linear-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-2xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Need expert human review?</div>
              <div className="text-[11px] text-slate-500">Get your CV tailored by an industry veteran.</div>
            </div>
          </div>
          <Link
            href="/services"
            className="px-3 py-1.5 bg-white border border-sky-200 text-sky-700 font-bold text-xs rounded-xl shadow-xs hover:bg-sky-50 transition-colors whitespace-nowrap inline-flex items-center justify-center cursor-pointer"
          >
            Consult with expert
          </Link>
        </div>
      </div>

      {/* Right Resume Live Preview: 7 Cols */}
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
