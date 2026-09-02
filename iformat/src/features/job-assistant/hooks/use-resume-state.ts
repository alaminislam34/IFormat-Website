"use client";

import * as React from "react";
import { toast } from "sonner";
import { aiService } from "@/services/ai.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUserCVs, useCreateCV, useSaveCVVersion, useDeleteCV } from "@/hooks";
import { CVDTO } from "@/types/api";
import { ResumeData, DEFAULT_RESUME } from "../types/resume.types";

export function useResumeState() {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<ResumeData>(DEFAULT_RESUME);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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
      toast.success(`Loaded "${cv.title}" (v${latestVersion.versionNumber})`);
    }
  };

  const handleNewResume = () => {
    setData(DEFAULT_RESUME);
    setActiveCvId(null);
    setActiveCvTitle("My Resume");
    setActiveVersionNumber(1);
    setSavedModalOpen(false);
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
  };

  const handleWorkChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      ),
    }));
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
  };

  const addEdu = () => {
    setData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        { id: String(Date.now()), institution: "", degree: "", duration: "", location: "" },
      ],
    }));
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
  };

  const addSkillGroup = () => {
    setData((prev) => ({
      ...prev,
      skillGroups: [...prev.skillGroups, { id: String(Date.now()), category: "", skills: "" }],
    }));
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
        jobTitle: prev.jobTitle || "Senior Full Stack & AI Architect",
        email: prev.email || "alex.morgan@example.com",
        phone: prev.phone || "+1 (555) 234-5678",
        location: prev.location || "Dubai, UAE",
        website: prev.website || "linkedin.com/in/alexmorgan",
        summary:
          prev.summary ||
          "High-impact Technology Leader & Full-Stack Architect with 8+ years of expertise scaling distributed cloud architectures, leading cross-functional engineering squads, and driving ATS-optimized digital transformation initiatives with proven ROI.",
        workExperience:
          prev.workExperience.length > 0
            ? prev.workExperience
            : [
                {
                  id: "demo-w1",
                  role: "Lead Full Stack Engineer",
                  company: "Apex Global Technologies",
                  duration: "2021 - Present",
                  location: "Dubai, UAE",
                  description:
                    "Architected high-throughput cloud microservices serving 2M+ active users. Boosted system latency by 42% and spearheaded AI-powered internal tooling adoption.",
                },
                {
                  id: "demo-w2",
                  role: "Senior Software Engineer",
                  company: "Vanguard Digital Systems",
                  duration: "2018 - 2021",
                  location: "London, UK",
                  description:
                    "Led end-to-end full-stack development of enterprise SaaS platforms using Next.js, Node.js, and TypeScript with 99.99% SLA uptime.",
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
      toast.success("Guest demo profile loaded! You can preview and edit all fields.");
    }, 800);
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
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
        toast.success("AI generated and polished your resume summary!");
      }
    } catch (err: any) {
      if (
        err?.status === 402 ||
        err?.message?.includes("PLAN_LIMIT_REACHED") ||
        err?.message?.includes("quota")
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
    window.print();
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
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Resume text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return {
    step,
    setStep,
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
