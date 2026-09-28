"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  EyeOff,
  Database,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  FileCheck,
  Server,
  KeyRound,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/footer";

const SECTIONS = [
  { id: "overview", title: "1. Overview & Commitment" },
  { id: "collection", title: "2. Information We Collect" },
  { id: "usage", title: "3. How We Process & Use Data" },
  { id: "ai-processing", title: "4. AI Career Assistant & Data Privacy" },
  { id: "subprocessors", title: "5. Third-Party Subprocessors & Storage" },
  { id: "cookies", title: "6. Cookies & Authentication Tokens" },
  { id: "retention", title: "7. Data Retention & Permanent Deletion" },
  { id: "your-rights", title: "8. Your Privacy Rights (GDPR & Global)" },
  { id: "security", title: "9. Security & Cryptographic Safeguards" },
  { id: "contact", title: "10. Contact Data Protection Officer" },
];

export function PrivacyView() {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Privacy Policy link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-24 selection:bg-[#0A54B1]/10 selection:text-[#0A54B1]">
      <main className="flex-1 pb-20">
        {/* Top Header Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-slate-900 via-[#0a192f] to-slate-900 text-white py-16 md:py-20 border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(34,211,238,0.25),rgba(255,255,255,0))]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300">Legal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-cyan-400 font-bold">Privacy Policy</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                  <Shield className="w-3.5 h-3.5" />
                  Data Protection & Privacy • GDPR & CCPA Aligned
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                  Privacy Policy
                </h1>
                <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                  Your career credentials and personal identity are protected with rigorous cryptographic security. 
                  Learn how iFormat collects, processes, and safeguards your data across our platforms.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 print:hidden">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all backdrop-blur-sm cursor-pointer active:scale-95 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  Print Policy
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all backdrop-blur-sm cursor-pointer active:scale-95 shadow-sm"
                >
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Highlights Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-cyan-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Zero Data Selling</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We never sell, rent, or trade your personal records, CVs, or contact info to data brokers.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-cyan-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Bank-Grade Encryption</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Encrypted in transit with TLS 1.3 and at rest with AES-256 AWS S3 document protection.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-cyan-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mb-3">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Private AI Architecture</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your resume text is processed through dedicated private microservices without public model training.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-cyan-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">User Sovereignty</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Full GDPR rights to export your entire profile or execute permanent one-click account erasure.
              </p>
            </div>
          </div>
        </section>

        {/* Main Content Area with Sticky Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sidebar Sticky Navigation */}
            <aside className="lg:col-span-4 print:hidden">
              <div className="sticky top-28 space-y-6">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-600" />
                    Privacy Sections
                  </h4>
                  <nav className="space-y-1">
                    {SECTIONS.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`block text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
                          activeSection === section.id
                            ? "bg-cyan-50 text-cyan-700 font-bold border-l-2 border-cyan-600"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Terms Switcher Box */}
                <div className="bg-linear-to-br from-slate-900 to-[#0A54B1] text-white rounded-2xl p-5 shadow-md">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Server className="w-5 h-5 text-cyan-300" />
                    <h4 className="font-bold text-sm">Terms of Service</h4>
                  </div>
                  <p className="text-xs text-blue-100 mb-4 leading-relaxed">
                    Review candidate and employer rights, subscription agreements, and acceptable usage rules.
                  </p>
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0A54B1] text-xs font-bold hover:bg-cyan-50 transition-colors shadow-sm"
                  >
                    Read Terms of Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Data Protection Contact */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    Data Protection Officer
                  </h5>
                  <p className="mb-3 text-slate-500">
                    To exercise GDPR data export, account deletion, or report a privacy concern:
                  </p>
                  <a
                    href="mailto:devamin.bd@gmail.com"
                    className="text-[#0A54B1] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    devamin.bd@gmail.com <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Content Article */}
            <article className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-12 text-slate-700 leading-relaxed text-sm md:text-base">
              {/* Introduction */}
              <div className="pb-6 border-b border-slate-100">
                <p className="text-slate-600 leading-relaxed">
                  This Privacy Policy details the policies and practices of <strong>iFormat Personal Branding</strong> (&quot;<strong>iFormat</strong>&quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;) 
                  regarding the collection, storage, processing, transfer, and disclosure of your personal data when using our ecosystem of services. 
                  We adhere strictly to international privacy frameworks including the General Data Protection Regulation (<strong>GDPR</strong>) and the California Consumer Privacy Act (<strong>CCPA</strong>).
                </p>
              </div>

              {/* Section 1 */}
              <section id="overview" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  1. Overview & Privacy Principles
                </h2>
                <p>
                  We operate on fundamental privacy-by-design principles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">Data Minimization</h5>
                    <p className="text-xs text-slate-600">We only collect data strictly necessary to deliver ATS resume analysis, job matching, and platform authentication.</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <h5 className="font-bold text-slate-900 text-xs uppercase mb-1">Purpose Limitation</h5>
                    <p className="text-xs text-slate-600">Your career data is never used for secondary marketing purposes or undisclosed commercial analytics.</p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="collection" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  2. Information We Collect
                </h2>
                <p>Depending on your interactions with iFormat, we collect the following categories of information:</p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-sm mb-1 text-[#0A54B1]">A. Account & Profile Information</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Full name, email address, password hash (bcrypt), telephone number, profile avatar, role selection (Candidate or Employer), and OAuth identifiers (Google Account ID) when signing in with Google.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-sm mb-1 text-cyan-700">B. Career & Professional Content (Candidates)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Resumes, CV files (PDF, DOCX), employment history, education, certifications, portfolio links, cover letters, target job titles, and career preferences.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-sm mb-1 text-indigo-700">C. Company & Hiring Data (Employers)</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Company name, corporate email, industry, company website, logo, job listing descriptions, hiring requirements, and applicant evaluation notes.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h4 className="font-bold text-sm mb-1 text-slate-800">D. Technical & Log Data</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      IP addresses, browser type, device operating system, referring URLs, access timestamps, and session tokens managed via HttpOnly secure cookies.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section id="usage" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  3. How We Process & Use Your Information
                </h2>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li><strong>Service Execution:</strong> Generating ATS-optimized resume formats, calculating match percentages, and submitting job applications to employers you select.</li>
                  <li><strong>Authentication & Security:</strong> Maintaining secure dual-token authentication (short-lived access tokens and 7-day refresh tokens) and rate-limiting brute force attempts.</li>
                  <li><strong>Transactional Notifications:</strong> Sending OTP verification codes, password resets, application status alerts, and interview invitations via verified Amazon SES / SMTP.</li>
                  <li><strong>Financial Processing:</strong> Billing subscription tiers through Stripe, managing automated renewal intervals, and maintaining tax compliance records.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section id="ai-processing" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  4. AI Career Assistant & Responsible AI
                </h2>
                <p>
                  Our AI microservice (hosted on <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">ai.iformatbranding.com</code>) leverages enterprise foundation models via Amazon Bedrock:
                </p>
                <div className="p-4 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2 text-xs md:text-sm text-cyan-950">
                  <div className="flex items-center gap-2 font-bold text-cyan-900">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                    Private Inference Commitment
                  </div>
                  <p>
                    1. <strong>No Public Training:</strong> Your resume text, personal background, and application materials are <em>never</em> used to train, retrain, or improve public foundation models.
                  </p>
                  <p>
                    2. <strong>Transient Processing:</strong> Prompt payloads sent to the AI microservice are processed strictly in memory during analysis and discarded once recommendations are returned.
                  </p>
                  <p>
                    3. <strong>Data Encryption:</strong> All communications between the backend API and the AI engine travel over encrypted HTTPS / TLS channels.
                  </p>
                </div>
              </section>

              {/* Section 5 */}
              <section id="subprocessors" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  5. Third-Party Subprocessors & Infrastructure
                </h2>
                <p>We work exclusively with ISO 27001 and SOC 2 Type II certified cloud infrastructure partners:</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                      <tr>
                        <th className="p-3 border-b border-slate-200">Subprocessor</th>
                        <th className="p-3 border-b border-slate-200">Purpose</th>
                        <th className="p-3 border-b border-slate-200">Location</th>
                        <th className="p-3 border-b border-slate-200">Security Standard</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Amazon Web Services (AWS)</td>
                        <td className="p-3">RDS PostgreSQL & S3 Media / Resume Storage</td>
                        <td className="p-3">Frankfurt (eu-central-1)</td>
                        <td className="p-3">SOC 1/2/3, ISO 27001, HIPAA</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Google Cloud (OAuth 2.0)</td>
                        <td className="p-3">Single Sign-On & Account Verification</td>
                        <td className="p-3">Global</td>
                        <td className="p-3">SOC 2/3, ISO 27001</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Stripe, Inc.</td>
                        <td className="p-3">Subscription Billing & Invoicing Gateway</td>
                        <td className="p-3">United States / Global</td>
                        <td className="p-3">PCI-DSS Level 1 Certified</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold text-slate-900">Redis Labs / Cloud</td>
                        <td className="p-3">Session Store & Distributed Rate Limiting</td>
                        <td className="p-3">Europe / Cloud</td>
                        <td className="p-3">TLS Enforced, Memory Guard</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Section 6 */}
              <section id="cookies" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  6. Cookies & Tracking Technologies
                </h2>
                <p>
                  iFormat uses essential first-party cookies necessary for platform navigation and session integrity:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li><strong>accessToken:</strong> Short-lived JWT (15-minute expiration) configured with <code className="text-xs bg-slate-100 px-1 rounded font-mono">HttpOnly</code>, <code className="text-xs bg-slate-100 px-1 rounded font-mono">Secure</code>, and <code className="text-xs bg-slate-100 px-1 rounded font-mono">SameSite=Lax</code> for secure API requests.</li>
                  <li><strong>refreshToken:</strong> 7-day cryptographic refresh token used exclusively to seamlessly renew access tokens without requiring frequent credential prompts.</li>
                  <li><strong>userRole:</strong> Read-only browser cookie identifying whether the active session is a Candidate or Employer to prevent unauthorized portal routing.</li>
                </ul>
                <p className="text-xs text-slate-500">
                  We do not utilize cross-site tracking cookies, third-party advertising pixels, or invasive behavioral trackers.
                </p>
              </section>

              {/* Section 7 */}
              <section id="retention" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  7. Data Retention & Permanent Deletion
                </h2>
                <p>
                  We retain your profile data and uploaded resumes for as long as your account remains active. 
                  When you initiate an account deletion request through your dashboard:
                </p>
                <div className="space-y-2 text-xs md:text-sm text-slate-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Your account profile, credentials, and OAuth tokens are permanently dropped from our primary PostgreSQL database.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>All associated resume PDFs and documents stored in AWS S3 buckets are deleted via cryptographically enforced purge routines.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Financial invoices are archived for the statutory duration required by commercial tax and anti-fraud regulations.</span>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section id="your-rights" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  8. Your Privacy Rights (GDPR & Global Rights)
                </h2>
                <p>Under international data protection legislation, you enjoy the following enforceable rights:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block mb-0.5">Right of Access (Article 15)</strong>
                    <span className="text-slate-500">Request a complete copy of all personal and career data maintained in your account.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block mb-0.5">Right to Rectification (Article 16)</strong>
                    <span className="text-slate-500">Update or amend incomplete or inaccurate profile details directly via your settings.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block mb-0.5">Right to Erasure / To Be Forgotten (Article 17)</strong>
                    <span className="text-slate-500">Demand the complete, unrecoverable deletion of your personal records and CV documents.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <strong className="text-slate-900 block mb-0.5">Right to Data Portability (Article 20)</strong>
                    <span className="text-slate-500">Export your formatted resume documents and profile data in standardized digital formats.</span>
                  </div>
                </div>
              </section>

              {/* Section 9 */}
              <section id="security" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  9. Security & Cryptographic Safeguards
                </h2>
                <p>
                  We implement multi-layered physical, administrative, and technological safeguards to prevent unauthorized access, disclosure, or alteration of your records:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li><strong>TLS 1.3 Encryption:</strong> All browser-to-server traffic is encrypted using modern high-cipher SSL/TLS certificates.</li>
                  <li><strong>Role-Based Access Control (RBAC):</strong> Server middleware strictly limits route access so candidates and employers can never access each other&apos;s private onboarding or management dashboards.</li>
                  <li><strong>Automated Secret Protection:</strong> API keys, RDS connection credentials, and webhook secrets are isolated in protected environment vaults with zero public exposure.</li>
                </ul>
              </section>

              {/* Section 10 */}
              <section id="contact" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  10. Contact Our Data Protection Team
                </h2>
                <p>
                  If you have inquiries, wish to exercise any of your statutory privacy rights, or need assistance regarding this Privacy Policy, our dedicated team is at your service:
                </p>

                <div className="p-5 rounded-2xl bg-slate-900 text-white mt-6 space-y-3">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    Data Protection & Compliance Office
                  </h4>
                  <div className="pt-2 text-xs md:text-sm space-y-1.5 text-slate-300">
                    <p><strong className="text-white">Organization:</strong> iFormat Personal Branding & Career Platform</p>
                    <p><strong className="text-white">Direct Privacy Email:</strong> <a href="mailto:devamin.bd@gmail.com" className="text-cyan-400 hover:underline">devamin.bd@gmail.com</a></p>
                    <p><strong className="text-white">Customer Support:</strong> <a href="mailto:support@iformatbranding.com" className="text-cyan-400 hover:underline">support@iformatbranding.com</a></p>
                    <p><strong className="text-white">Response Commitment:</strong> All verified data access, export, or erasure requests are addressed within 30 days.</p>
                  </div>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
