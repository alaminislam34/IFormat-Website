"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  Mic, 
  Copy, 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Globe,
  Printer,
  Cloud,
  FolderOpen,
  Save,
  Loader2,
  CheckCircle2,
  Clock,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { aiService } from "@/services/ai.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { useUserCVs, useCreateCV, useSaveCVVersion, useDeleteCV } from "@/hooks";
import { CVDTO } from "@/types/api";
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { UpgradeModal } from "@/components/ui/upgrade-modal";

const Linkedin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface ResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
  workExperience: Array<{
    id: string;
    company: string;
    role: string;
    duration: string;
    location: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    duration: string;
    location: string;
  }>;
  skillGroups: Array<{
    id: string;
    category: string;
    skills: string;
  }>;
  certifications: Array<{
    id: string;
    name: string;
    link: string;
  }>;
  languages: string;
  interests: string;
}

const DEFAULT_RESUME: ResumeData = {
  fullName: "MD Sifat Islam",
  jobTitle: "Senior Full Stack Developer",
  email: "sifat70640@gmail.com",
  phone: "+33 6 12 34 56 78",
  location: "Paris, France",
  linkedin: "linkedin.com/in/johndoe",
  website: "johndoe.com",
  summary: "Passionate Full Stack Developer with 5+ years of experience building high-performance web applications. Expert in React, Next.js, Node.js, and modern cloud architectures.",
  workExperience: [
    {
      id: "1",
      company: "Vercel Inc",
      role: "Senior Full Stack Developer",
      duration: "Jan 2020 - Present",
      location: "Remote",
      description: "Led development of core developer dashboard features.\nOptimized Next.js page loading times by 40%.\nMentored junior engineers and designed scalable database schemas."
    }
  ],
  education: [
    {
      id: "1",
      institution: "Sorbonne University",
      degree: "Master of Computer Science",
      duration: "2018 - 2020",
      location: "Paris, France"
    }
  ],
  skillGroups: [
    {
      id: "1",
      category: "Frontend",
      skills: "React, Next.js, TypeScript, Tailwind CSS, Redux"
    },
    {
      id: "2",
      category: "Backend",
      skills: "Node.js, NestJS, Express, PostgreSQL, Redis, GraphQL"
    }
  ],
  certifications: [
    {
      id: "1",
      name: "AWS Certified Solutions Architect",
      link: "https://aws.amazon.com"
    }
  ],
  languages: "English: Native, French: B2",
  interests: "Open Source Contributions, Artificial Intelligence, Running, Web Performance"
};

export function ResumeBuilder() {
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

  const router = useRouter();
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
        // Save new version
        const newVersion = await saveVersionMutation.mutateAsync({
          cvId: activeCvId,
          payload: { content: data },
        });
        setActiveVersionNumber(newVersion.versionNumber);
        toast.success(`Saved new version (v${newVersion.versionNumber}) to cloud!`);
      } else {
        // Create new CV
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

  // Stepper steps
  const steps = [
    { num: 1, label: "STEP 1", icon: <User className="w-4 h-4" /> },
    { num: 2, label: "STEP 2", icon: <FileText className="w-4 h-4" /> },
    { num: 3, label: "STEP 3", icon: <Briefcase className="w-4 h-4" /> },
    { num: 4, label: "STEP 4", icon: <GraduationCap className="w-4 h-4" /> },
    { num: 5, label: "STEP 5", icon: <Award className="w-4 h-4" /> }
  ];

  // Helper handlers
  const handleInputChange = <K extends keyof ResumeData>(field: K, value: ResumeData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.map((w) =>
        w.id === id ? { ...w, [field]: value } : w
      )
    }));
  };

  const addWork = () => {
    const newWork = {
      id: String(Date.now()),
      company: "",
      role: "",
      duration: "Jan 2020 - Present",
      location: "",
      description: ""
    };
    setData((prev) => ({
      ...prev,
      workExperience: [...prev.workExperience, newWork]
    }));
  };

  const removeWork = (id: string) => {
    setData((prev) => ({
      ...prev,
      workExperience: prev.workExperience.filter((w) => w.id !== id)
    }));
  };

  const handleEduChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.map((e) =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }));
  };

  const addEdu = () => {
    const newEdu = {
      id: String(Date.now()),
      institution: "",
      degree: "",
      duration: "",
      location: ""
    };
    setData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEdu = (id: string) => {
    setData((prev) => ({
      ...prev,
      education: prev.education.filter((e) => e.id !== id)
    }));
  };

  const handleSkillGroupChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    }));
  };

  const addSkillGroup = () => {
    const newGroup = {
      id: String(Date.now()),
      category: "",
      skills: ""
    };
    setData((prev) => ({
      ...prev,
      skillGroups: [...prev.skillGroups, newGroup]
    }));
  };

  const removeSkillGroup = (id: string) => {
    setData((prev) => ({
      ...prev,
      skillGroups: prev.skillGroups.filter((s) => s.id !== id)
    }));
  };

  const handleCertChange = (id: string, field: string, value: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c) =>
        c.id === id ? { ...c, [field]: value } : c
      )
    }));
  };

  const addCert = () => {
    const newCert = {
      id: String(Date.now()),
      name: "",
      link: ""
    };
    setData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const removeCert = (id: string) => {
    setData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((c) => c.id !== id)
    }));
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
        data.certifications.length > 0
          ? `Certifications:\n${data.certifications.map((c) => `- ${c.name} (${c.link || ""})`).join("\n")}`
          : "",
        data.languages ? `Languages: ${data.languages}` : "",
        data.interests ? `Interests: ${data.interests}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      await aiService.buildCv({
        user_info: {
          fullName: data.fullName,
          jobTitle: data.jobTitle,
          email: data.email,
          phone: data.phone,
          location: data.location,
          linkedin: data.linkedin,
          website: data.website,
        },
        raw_notes: rawNotes || `Resume for ${data.fullName} as ${data.jobTitle || "Professional"}`,
        targetRole: data.jobTitle || "Software Engineer",
        targetIndustry: "Technology",
      });

      toast.success("AI generated your CV successfully!");
      setStep(6); // Move to resume preview
    } catch (err: any) {
      if (err?.code === "SUBSCRIPTION_REQUIRED" || err?.statusCode === 403) {
        setShowUpgradeModal(true);
      } else {
        toast.error(err?.message || "Failed to generate CV. Please check your inputs and try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const textContent = `
${data.fullName} - ${data.jobTitle}
Email: ${data.email} | Phone: ${data.phone} | Location: ${data.location}
LinkedIn: ${data.linkedin} | Website: ${data.website}

SUMMARY
${data.summary}

WORK EXPERIENCE
${data.workExperience.map(w => `${w.role} at ${w.company} (${w.duration}) - ${w.location}\n${w.description}`).join('\n\n')}

EDUCATION
${data.education.map(e => `${data.education ? `${e.degree} - ${e.institution} (${e.duration})` : ""}`).join('\n')}

SKILLS
${data.skillGroups.map(s => `${s.category}: ${s.skills}`).join('\n')}

CERTIFICATIONS
${data.certifications.map(c => `${c.name} (${c.link})`).join('\n')}
    `;
    navigator.clipboard.writeText(textContent.trim());
    setCopied(true);
    toast.success("CV copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    toast.success("Preparing CV for print/export...");
    window.print();
  };

  return (
    <div className="w-full">
      {/* Cloud CV Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {activeCvId ? activeCvTitle : "Unsaved Resume Draft"}
              </span>
              {activeCvId && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Version {activeVersionNumber}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isAuthenticated
                ? activeCvId
                  ? "Synced to cloud. Every save increments your version history."
                  : "Save to your cloud account for instant job applications and versioning."
                : "Log in to save multiple resume versions to your account."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {isAuthenticated && (
            <Button
              onClick={() => setSavedModalOpen(true)}
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 font-medium"
            >
              <FolderOpen className="w-4 h-4 mr-1.5 text-blue-400" />
              My Cloud Resumes {userCVs && userCVs.length > 0 ? `(${userCVs.length})` : ""}
            </Button>
          )}

          <Button
            onClick={handleSaveToCloud}
            disabled={isSaving}
            size="sm"
            className="h-9 px-4 text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 mr-1.5" />
                {activeCvId ? "Save New Version" : "Save to Cloud"}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Consult with expert badge & Header for step-builder */}
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

          <button className="px-5 py-2.5 bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/15 hover:opacity-90 transition-opacity cursor-pointer">
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
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="step1"
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={data.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      placeholder="e.g. MD Sifat Islam"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                    <input
                      type="text"
                      value={data.jobTitle}
                      onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                      placeholder="e.g. Senior Full Stack Developer"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="e.g. sifat70640@gmail.com"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      value={data.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="e.g. +33 6 12 34 56 78"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="e.g. Paris, France"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn URL</label>
                    <input
                      type="text"
                      value={data.linkedin}
                      onChange={(e) => handleInputChange("linkedin", e.target.value)}
                      placeholder="e.g. linkedin.com/in/johndoe"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Website</label>
                    <input
                      type="text"
                      value={data.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="e.g. johndoe.com"
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end items-center pt-6 border-t border-slate-100">
                  <Button onClick={() => setStep(2)} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Summary */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="step2"
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Summary</h2>
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={data.summary}
                    onChange={(e) => handleInputChange("summary", e.target.value)}
                    placeholder="Write about yourself, your career highlights, and major skills..."
                    className="w-full p-5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium leading-relaxed resize-none"
                  />
                  <button className="absolute right-4 bottom-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <Button onClick={() => setStep(1)} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
                    Previous
                  </Button>
                  <Button onClick={() => setStep(3)} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Work Experience */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="step3"
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Work Experience</h2>
                </div>

                <div className="space-y-6">
                  {data.workExperience.map((work) => (
                    <div
                      key={work.id}
                      className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 relative group hover:border-slate-200 hover:bg-white transition-all"
                    >
                      {data.workExperience.length > 1 && (
                        <button
                          onClick={() => removeWork(work.id)}
                          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Company</label>
                          <input
                            type="text"
                            value={work.company}
                            onChange={(e) => handleWorkChange(work.id, "company", e.target.value)}
                            placeholder="e.g. Vercel Inc"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
                          <input
                            type="text"
                            value={work.role}
                            onChange={(e) => handleWorkChange(work.id, "role", e.target.value)}
                            placeholder="e.g. Senior Full Stack Developer"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                          <input
                            type="text"
                            value={work.duration}
                            onChange={(e) => handleWorkChange(work.id, "duration", e.target.value)}
                            placeholder="e.g. Jan 2020 - Present"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                          <input
                            type="text"
                            value={work.location}
                            onChange={(e) => handleWorkChange(work.id, "location", e.target.value)}
                            placeholder="e.g. Remote / Paris, France"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Description (One point per line)</label>
                          <textarea
                            rows={4}
                            value={work.description}
                            onChange={(e) => handleWorkChange(work.id, "description", e.target.value)}
                            placeholder="Led a team of developers...&#10;Built and optimized APIs..."
                            className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium leading-relaxed resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addWork}
                    className="w-full py-4 border border-dashed border-sky-300 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-2 text-sky-600 hover:text-sky-700 bg-sky-50/20 hover:bg-sky-50/50 transition-all font-semibold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Work Experience
                  </button>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <Button onClick={() => setStep(2)} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
                    Previous
                  </Button>
                  <Button onClick={() => setStep(4)} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Education */}
            {step === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="step4"
                className="space-y-8"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Education</h2>
                  </div>
                  <p className="text-xs text-slate-500 pl-13">Add your academic background and achievements.</p>
                </div>

                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <div
                      key={edu.id}
                      className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 relative group hover:border-slate-200 hover:bg-white transition-all"
                    >
                      {data.education.length > 1 && (
                        <button
                          onClick={() => removeEdu(edu.id)}
                          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => handleEduChange(edu.id, "institution", e.target.value)}
                            placeholder="e.g. Sorbonne University"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Degree</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => handleEduChange(edu.id, "degree", e.target.value)}
                            placeholder="e.g. Master of Computer Science"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duration</label>
                          <input
                            type="text"
                            value={edu.duration}
                            onChange={(e) => handleEduChange(edu.id, "duration", e.target.value)}
                            placeholder="e.g. 2018 - 2020"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => handleEduChange(edu.id, "location", e.target.value)}
                            placeholder="e.g. Paris, France"
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={addEdu}
                    className="w-full py-4 border border-dashed border-sky-300 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-2 text-sky-600 hover:text-sky-700 bg-sky-50/20 hover:bg-sky-50/50 transition-all font-semibold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Education
                  </button>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <Button onClick={() => setStep(3)} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
                    Previous
                  </Button>
                  <Button onClick={() => setStep(5)} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2">
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Skills & More */}
            {step === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                key="step5"
                className="space-y-8"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Skills & More</h2>
                </div>

                <div className="space-y-6">
                  {/* Skill groups */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skill Groups (e.g. Frontend: React, Next.js)</label>
                    <div className="space-y-3">
                      {data.skillGroups.map((group) => (
                        <div key={group.id} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={group.category}
                            onChange={(e) => handleSkillGroupChange(group.id, "category", e.target.value)}
                            placeholder="Group name (e.g. Frontend)"
                            className="w-1/3 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                          />
                          <input
                            type="text"
                            value={group.skills}
                            onChange={(e) => handleSkillGroupChange(group.id, "skills", e.target.value)}
                            placeholder="React, Next.js, HTML, CSS"
                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                          />
                          <button
                            onClick={() => removeSkillGroup(group.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addSkillGroup}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A54B1] hover:underline"
                    >
                      + Add Group
                    </button>
                  </div>

                  {/* Certifications */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certifications</label>
                    <div className="space-y-3">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="flex gap-3 items-center">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => handleCertChange(cert.id, "name", e.target.value)}
                            placeholder="Certificate Name"
                            className="w-1/2 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                          />
                          <input
                            type="text"
                            value={cert.link}
                            onChange={(e) => handleCertChange(cert.id, "link", e.target.value)}
                            placeholder="Verification Link"
                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                          />
                          <button
                            onClick={() => removeCert(cert.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={addCert}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A54B1] hover:underline"
                    >
                      + Add Certification
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Languages (e.g. English: Native, French: B2)</label>
                      <textarea
                        rows={3}
                        value={data.languages}
                        onChange={(e) => handleInputChange("languages", e.target.value)}
                        placeholder="e.g. English: Fluent, Spanish: Conversational"
                        className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interests</label>
                      <textarea
                        rows={3}
                        value={data.interests}
                        onChange={(e) => handleInputChange("interests", e.target.value)}
                        placeholder="e.g. Open Source, Hiking, Design Systems"
                        className="w-full p-4 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                  <Button onClick={() => setStep(4)} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
                    Previous
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    className="bg-brand-gradient text-white hover:opacity-95 px-8 h-11 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-blue/20 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" /> GENERATE CV/RESUME
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: CV Preview */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                key="step6"
                className="space-y-8"
              >
                {/* Preview Actions bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <button
                    onClick={() => setStep(5)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Edit Details
                  </button>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Button
                      onClick={handleSaveToCloud}
                      disabled={isSaving}
                      className="bg-emerald-600 hover:bg-emerald-500 h-10 px-4 rounded-xl text-white flex items-center gap-2 text-xs font-semibold shadow-sm"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          {activeCvId ? `Save Version (v${activeVersionNumber + 1})` : "Save to Cloud"}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCopy}
                      variant="outline"
                      className="h-10 px-4 rounded-xl border-slate-200 text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-2 text-xs font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy Text"}
                    </Button>
                    <Button
                      onClick={handlePrint}
                      className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 h-10 px-4 rounded-xl text-white flex items-center gap-2 text-xs font-semibold shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print / PDF
                    </Button>
                  </div>
                </div>

                {/* Print area / CV Template */}
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-inner bg-slate-100/50 p-4 md:p-8 flex justify-center">
                  <div className="bg-white w-full max-w-200 shadow-lg rounded-xl border border-slate-200 p-8 md:p-12 space-y-8 text-slate-800 text-left font-sans select-text print:shadow-none print:border-none print:p-0">
                    {/* Header */}
                    <div className="border-b-2 border-slate-100 pb-6 space-y-3">
                      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{data.fullName || "Your Full Name"}</h1>
                      <h2 className="text-lg font-bold text-[#0A54B1]">{data.jobTitle || "Job Title"}</h2>
                      
                      {/* Contacts bar */}
                      <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs font-semibold text-slate-500">
                        {data.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> {data.email}
                          </span>
                        )}
                        {data.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> {data.phone}
                          </span>
                        )}
                        {data.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" /> {data.location}
                          </span>
                        )}
                        {data.website && (
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-slate-400" /> {data.website}
                          </span>
                        )}
                        {data.linkedin && (
                          <span className="flex items-center gap-1.5">
                            <Linkedin className="w-3.5 h-3.5 text-slate-400" /> {data.linkedin}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Summary */}
                    {data.summary && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Professional Summary</h3>
                        <p className="text-slate-600 text-sm leading-relaxed font-medium">{data.summary}</p>
                      </div>
                    )}

                    {/* Experience */}
                    {data.workExperience.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Professional Experience</h3>
                        <div className="space-y-6">
                          {data.workExperience.map((work) => (
                            <div key={work.id} className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm font-bold">
                                <span className="text-slate-800 font-extrabold">{work.role || "Job Role"}</span>
                                <span className="text-slate-500 font-semibold text-xs">{work.duration}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-500">
                                <span className="text-[#0A54B1] font-bold">{work.company || "Company Name"}</span>
                                <span>{work.location}</span>
                              </div>
                              {work.description && (
                                <ul className="list-disc list-inside pl-2 space-y-1">
                                  {work.description.split("\n").map((line, idx) => (
                                    <li key={idx} className="text-slate-600 text-xs leading-relaxed font-medium">
                                      {line}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {data.education.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Education</h3>
                        <div className="space-y-4">
                          {data.education.map((edu) => (
                            <div key={edu.id} className="space-y-1">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm font-bold">
                                <span className="text-slate-800 font-extrabold">{edu.degree || "Degree"}</span>
                                <span className="text-slate-500 font-semibold text-xs">{edu.duration}</span>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold text-slate-500">
                                <span className="text-[#0A54B1] font-bold">{edu.institution || "Institution"}</span>
                                <span>{edu.location}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {data.skillGroups.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Skills</h3>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          {data.skillGroups.map((group) => (
                            <div key={group.id} className="space-y-1">
                              <span className="font-extrabold text-slate-800">{group.category || "Category"}:</span>
                              <span className="text-slate-600 leading-relaxed font-medium ml-1">{group.skills || "Skills listed"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certifications, Languages, Interests */}
                    <div className="grid sm:grid-cols-2 gap-6 pt-2">
                      {data.certifications.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Certifications</h3>
                          <ul className="list-disc list-inside space-y-1 text-xs">
                            {data.certifications.map((cert) => (
                              <li key={cert.id} className="text-slate-600 font-medium">
                                {cert.link ? (
                                  <a href={cert.link} target="_blank" rel="noopener noreferrer" className="hover:text-[#0A54B1] hover:underline">
                                    {cert.name}
                                  </a>
                                ) : (
                                  cert.name
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="space-y-4">
                        {data.languages && (
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Languages</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">{data.languages}</p>
                          </div>
                        )}
                        {data.interests && (
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-1">Interests</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">{data.interests}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Saved Resumes Modal */}
      {savedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 md:p-8 space-y-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">My Cloud Resumes</h3>
                  <p className="text-xs text-slate-400">Load, switch, or manage your saved resumes</p>
                </div>
              </div>
              <button
                onClick={() => setSavedModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              <button
                onClick={handleNewResume}
                className="w-full p-4 rounded-2xl border border-dashed border-slate-700 hover:border-blue-500/60 bg-slate-800/40 hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2 text-sm font-semibold text-blue-400 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Start New Blank Resume
              </button>

              {loadingCVs ? (
                <div className="py-8 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Loading saved resumes...
                </div>
              ) : !userCVs || userCVs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No resumes saved to your cloud account yet. Click &quot;Save to Cloud&quot; to preserve your work.
                </div>
              ) : (
                userCVs.map((cv) => {
                  const versionNum = cv.versions?.[0]?.versionNumber || 1;
                  const isCurrent = activeCvId === cv.id;
                  return (
                    <div
                      key={cv.id}
                      onClick={() => handleLoadCV(cv)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? "bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-500/10"
                          : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{cv.title}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            v{versionNum}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          Last updated {new Date(cv.updatedAt || cv.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => handleDeleteCV(cv.id, e)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSavedModalOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthModal && (
        <AuthPromptModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          title="Sign in to Build & Save CV"
          description="Create a free account to generate AI-tailored CVs and save unlimited versions to the cloud."
          redirectUrl="/job-assistant"
        />
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
}
