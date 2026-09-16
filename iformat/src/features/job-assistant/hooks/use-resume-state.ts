"use client";

import * as React from "react";
import { toast } from "sonner";
import { aiService } from "@/services/ai.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUserCVs, useCreateCV, useSaveCVVersion, useDeleteCV } from "@/hooks";
import { CVDTO } from "@/types/api";
import { ResumeData, BLANK_RESUME } from "../types/resume.types";
import {
  resumePersonalInfoSchema,
  resumeSummarySchema,
  resumeWorkExperienceItemSchema,
  resumeEducationItemSchema,
  resumeSkillGroupSchema,
} from "@/lib/validations";

export function useResumeState() {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<ResumeData>(BLANK_RESUME);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Cloud Persistence & Versioning State
  const { isAuthenticated } = useAuthStore();
  const { data: userCVs, isLoading: loadingCVs } = useUserCVs();
  const createCVMutation = useCreateCV();
  const saveVersionMutation = useSaveCVVersion();
  const deleteCVMutation = useDeleteCV();

  const [activeCvId, setActiveCvId] = React.useState<string | null>(null);
  const [activeCvTitle, setActiveCvTitle] = React.useState<string>("My Resume");
  const [activeVersionNumber, setActiveVersionNumber] = React.useState<number>(1);
  const [savedModalOpen, setSavedModalOpen] = React.useState(false);
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);

  const isSaving = createCVMutation.isPending || saveVersionMutation.isPending;

  /**
   * Validate a specific wizard step using Zod schemas
   */
  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      const res = resumePersonalInfoSchema.safeParse({
        fullName: data.fullName,
        jobTitle: data.jobTitle,
        email: data.email,
        phone: data.phone,
        location: data.location,
        website: data.website,
      });

      if (!res.success) {
        const fieldErrors: Record<string, string> = {};
        res.error.issues.forEach((err) => {
          const key = err.path[0] as string;
          if (key && !fieldErrors[key]) {
            fieldErrors[key] = err.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }
      setErrors({});
      return true;
    }

    if (currentStep === 2) {
      const res = resumeSummarySchema.safeParse({ summary: data.summary });
      if (!res.success) {
        const msg = res.error.issues[0]?.message || "Please write your professional summary";
        setErrors({ summary: msg });
        return false;
      }
      setErrors({});
      return true;
    }

    if (currentStep === 3) {
      if (!data.workExperience || data.workExperience.length === 0) {
        setErrors({ workExperience: "Please add at least one work experience entry" });
        return false;
      }
      for (const work of data.workExperience) {
        const res = resumeWorkExperienceItemSchema.safeParse(work);
        if (!res.success) {
          const msg =
            res.error.issues[0]?.message ||
            "Please complete role, company, and description for all experiences";
          setErrors({ [`work_${work.id}`]: msg });
          return false;
        }
      }
      setErrors({});
      return true;
    }

    if (currentStep === 4) {
      if (!data.education || data.education.length === 0) {
        setErrors({ education: "Please add at least one education entry" });
        return false;
      }
      for (const edu of data.education) {
        const res = resumeEducationItemSchema.safeParse(edu);
        if (!res.success) {
          const msg =
            res.error.issues[0]?.message || "Please complete degree and institution for all education";
          setErrors({ [`edu_${edu.id}`]: msg });
          toast.error(msg);
          return false;
        }
      }
      setErrors({});
      return true;
    }

    if (currentStep === 5) {
      if (!data.skillGroups || data.skillGroups.length === 0) {
        setErrors({ skillGroups: "Please add at least one skill group" });
        return false;
      }
      for (const group of data.skillGroups) {
        const res = resumeSkillGroupSchema.safeParse(group);
        if (!res.success) {
          const msg =
            res.error.issues[0]?.message || "Please provide category name and skills for all groups";
          setErrors({ [`skill_${group.id}`]: msg });
          toast.error(msg);
          return false;
        }
      }
      setErrors({});
      return true;
    }

    return true;
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setErrors({});
      setStep((prev) => Math.min(prev + 1, 6));
    }
  };

  const goToPrevStep = () => {
    setErrors({});
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (targetStep: number) => {
    if (targetStep <= step) {
      setErrors({});
      setStep(targetStep);
      return;
    }
    for (let s = step; s < targetStep; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }
    setErrors({});
    setStep(targetStep);
  };

  const handleSaveToCloud = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    try {
      if (activeCvId) {
        const newVersion = await saveVersionMutation.mutateAsync({
          cvId: activeCvId,
          payload: { content: data },
        });
        setActiveVersionNumber(newVersion.versionNumber);
        toast.success(`Saved new version (v${newVersion.versionNumber}) to cloud!`);
      } else {
        const title = `${data.fullName || "My"} - ${data.jobTitle || "Resume"}`;
        const newCV = await createCVMutation.mutateAsync({
          title,
          content: data,
        });
        setActiveCvId(newCV.id);
        setActiveCvTitle(newCV.title);
        setActiveVersionNumber(1);
        toast.success("Resume created & saved to cloud!");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to save resume to cloud");
    }
  };

  const handleLoadCV = (cv: CVDTO) => {
    if (!cv.versions || cv.versions.length === 0) {
      toast.error("No saved versions found for this CV");
      return;
    }
    const latestVersion = cv.versions[0];
    if (latestVersion?.content) {
      setData(latestVersion.content as ResumeData);
      setActiveCvId(cv.id);
      setActiveCvTitle(cv.title);
      setActiveVersionNumber(latestVersion.versionNumber);
      setSavedModalOpen(false);
      setErrors({});
      toast.success(`Loaded "${cv.title}" (v${latestVersion.versionNumber})`);
    }
  };

  const handleNewResume = () => {
    setData(BLANK_RESUME);
    setActiveCvId(null);
    setActiveCvTitle("My Resume");
    setActiveVersionNumber(1);
    setSavedModalOpen(false);
    setErrors({});
    setStep(1);
    toast.info("Started new blank resume template");
  };

  const handleDeleteCV = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteCVMutation.mutateAsync(id);
      if (activeCvId === id) {
        handleNewResume();
      }
      toast.success("Resume deleted from cloud");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete resume");
    }
  };

  const handleInputChange = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const handleWorkChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
    if (errors[`work_${id}`] || errors.workExperience) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`work_${id}`];
        delete next.workExperience;
        return next;
      });
    }
  };

  const addWork = () => {
    setData((prev) => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        {
          id: String(Date.now()),
          company: "",
          role: "",
          duration: "Jan 2020 - Present",
          location: "",
          description: "",
        },
      ],
    }));
    if (errors.workExperience) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.workExperience;
        return next;
      });
    }
  };

  const removeWork = (id: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((w) => w.id !== id),
    }));
  };

  const handleEduChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      ),
    }));
    if (errors[`edu_${id}`] || errors.education) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`edu_${id}`];
        delete next.education;
        return next;
      });
    }
  };

  const addEdu = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: String(Date.now()), institution: "", degree: "", duration: "", location: "" },
      ],
    }));
    if (errors.education) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.education;
        return next;
      });
    }
  };

  const removeEdu = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id),
    }));
  };

  const handleSkillGroupChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
    if (errors[`skill_${id}`] || errors.skillGroups) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`skill_${id}`];
        delete next.skillGroups;
        return next;
      });
    }
  };

  const addSkillGroup = () => {
    setData((prev) => ({
      ...prev,
      skillGroups: [...prev.skillGroups, { id: String(Date.now()), category: "", skills: "" }],
    }));
    if (errors.skillGroups) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skillGroups;
        return next;
      });
    }
  };

  const removeSkillGroup = (id: string) => {
    setData((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.filter((s) => s.id !== id),
    }));
  };

  const handleCertChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      ),
    }));
  };

  const addCert = () => {
    setData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { id: String(Date.now()), name: "", link: "" }],
    }));
  };

  const removeCert = (id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id),
    }));
  };

  const handleDemoGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setData((prev) => ({
        ...prev,
        fullName: prev.fullName || "Alex Morgan",
        jobTitle: prev.jobTitle || "Lead Full Stack Architect",
        email: prev.email || "alex.morgan@example.com",
        phone: prev.phone || "+44 20 7946 0958",
        location: prev.location || "London, UK (Remote)",
        website: prev.website || "alexmorgan.tech",
        linkedin: prev.linkedin || "linkedin.com/in/alexmorgan",
        summary:
          prev.summary ||
          "Dynamic Full Stack Architect with 8+ years designing scalable cloud architectures, high-traffic SaaS systems, and AI-driven automation pipelines. Proven record leading cross-functional engineering teams, modernizing monolithic codebases, and reducing infrastructure latency by 45%.",
        workExperience:
          prev.workExperience.length > 0
            ? prev.workExperience
            : [
                {
                  id: "demo-w1",
                  role: "Lead Full Stack Architect",
                  company: "Vercel Inc",
                  duration: "2021 - Present",
                  location: "San Francisco, CA (Remote)",
                  description:
                    "Spearheaded distributed edge computing workflows serving 10M+ daily requests.\nDecreased p99 server latency by 38% through React Server Component caching.\nMentored 12 mid-level and senior engineers across EMEA timezones.",
                },
                {
                  id: "demo-w2",
                  role: "Senior Frontend Engineer",
                  company: "Stripe",
                  duration: "2018 - 2021",
                  location: "Dublin, Ireland",
                  description:
                    "Engineered real-time billing analytics dashboards with Next.js and TypeScript.\nReduced customer onboarding friction by 24% via modular UI component refactoring.",
                },
              ],
        education:
          prev.education.length > 0
            ? prev.education
            : [
                {
                  id: "demo-e1",
                  degree: "B.S. in Computer Science",
                  institution: "University of Manchester",
                  duration: "2014 - 2018",
                  location: "Manchester, UK",
                },
              ],
        skillGroups:
          prev.skillGroups.length > 0
            ? prev.skillGroups
            : [
                {
                  id: "demo-s1",
                  category: "Core Technologies",
                  skills: "TypeScript, React, Next.js, Node.js, Python, GraphQL, Docker",
                },
                {
                  id: "demo-s2",
                  category: "Architecture & Cloud",
                  skills: "AWS, Kubernetes, Microservices, CI/CD, Distributed Systems, PostgreSQL",
                },
              ],
      }));
      setIsGenerating(false);
      setErrors({});
      toast.success("Guest demo profile loaded! You can preview and edit all fields.");
    }, 800);
  };

  const handleGenerate = async () => {
    // 1. Strict Authentication Gate: User MUST be logged in to call AI
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    // 2. Validate all steps prior to calling AI
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setStep(s);
        return;
      }
    }

    try {
      setIsGenerating(true);

      const rawNotes = [
        data.summary ? `Professional Summary:\n${data.summary}` : "",
        data.workExperience.length > 0
          ? `Work Experience:\n${data.workExperience
              .map(
                (w) =>
                  `- ${w.role} at ${w.company} (${w.duration || "Present"}) in ${w.location || "Remote"}:\n  ${w.description}`
              )
              .join("\n")}`
          : "",
        data.education.length > 0
          ? `Education:\n${data.education
              .map((e) => `- ${e.degree} at ${e.institution} (${e.duration || ""})`)
              .join("\n")}`
          : "",
        data.skillGroups.length > 0
          ? `Skills:\n${data.skillGroups.map((s) => `- ${s.category}: ${s.skills}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      // Verify rawNotes is not empty before API request
      if (!rawNotes.trim()) {
        toast.error("Please add your summary or work experience before generating");
        setStep(1);
        setIsGenerating(false);
        return;
      }

      const res = await aiService.buildCv({
        raw_notes: rawNotes,
        targetRole: data.jobTitle || "Professional",
        targetIndustry: "General",
      });

      if (res) {
        if (res.personal?.summary) {
          setData((prev) => ({
            ...prev,
            summary: res.personal.summary || prev.summary,
          }));
        }
        setStep(6);
        toast.success("AI generated and polished your resume summary!");
      }
    } catch (err: any) {
      if (
        err?.code === "SUBSCRIPTION_REQUIRED" ||
        err?.status === 402 ||
        err?.status === 403 ||
        err?.statusCode === 403 ||
        err?.message?.includes("PLAN_LIMIT_REACHED") ||
        err?.message?.includes("quota") ||
        err?.message?.includes("limit")
      ) {
        setShowUpgradeModal(true);
      } else {
        toast.error(err?.message || "Failed to generate AI resume");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;

    // Set document title temporarily to the candidate's name so 'Save as PDF' defaults to a clean filename
    const originalTitle = document.title;
    const sanitizedName = data.fullName?.trim().replace(/[^a-zA-Z0-9_\-\s]/g, "").replace(/\s+/g, "_") || "My";
    document.title = `${sanitizedName}_Resume`;

    window.print();

    // Restore original website title once the browser print dialog closes
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  const handleCopy = () => {
    const text = `
${data.fullName.toUpperCase()}
${data.jobTitle}
${data.email} | ${data.phone} | ${data.location} | ${data.website}

SUMMARY
${data.summary}

EXPERIENCE
${data.workExperience
  .map(
    (w) => `${w.role} - ${w.company} (${w.duration}) [${w.location}]\n${w.description}`
  )
  .join("\n\n")}

EDUCATION
${data.education
  .map((e) => `${e.degree} - ${e.institution} (${e.duration}) [${e.location}]`)
  .join("\n")}

SKILLS
${data.skillGroups.map((s) => `${s.category}: ${s.skills}`).join("\n")}

CERTIFICATIONS
${data.certifications.map((c) => `${c.name} ${c.link ? `(${c.link})` : ""}`).join("\n")}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Resume copied to clipboard as formatted text!");
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    step,
    setStep,
    errors,
    data,
    setData,
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
    validateStep,
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
  };
}
