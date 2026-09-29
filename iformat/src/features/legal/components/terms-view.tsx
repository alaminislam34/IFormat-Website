"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  Bot,
  CreditCard,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  FileText,
  Lock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import { Footer } from "@/components/layout/footer";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "accounts", title: "2. Account Registration & Google OAuth" },
  { id: "candidates", title: "3. Candidate Services & AI Career Tools" },
  { id: "employers", title: "4. Employer Services & Job Postings" },
  { id: "billing", title: "5. Subscriptions, Payments & Refunds" },
  { id: "intellectual-property", title: "6. Intellectual Property & Content Ownership" },
  { id: "acceptable-use", title: "7. Acceptable Use & Prohibited Conduct" },
  { id: "suspension", title: "8. Account Termination & Suspension" },
  { id: "disclaimers", title: "9. Disclaimers & Limitation of Liability" },
  { id: "governing-law", title: "10. Governing Law & Contact Details" },
];

export function TermsView() {
  const [activeSection, setActiveSection] = useState("acceptance");

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
      toast.success("Page link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-24 selection:bg-[#0A54B1]/10 selection:text-[#0A54B1]">
      <main className="flex-1 pb-20">
        {/* Top Header Hero */}
        <section className="relative overflow-hidden bg-linear-to-b from-slate-900 via-[#0a192f] to-slate-900 text-white py-16 md:py-20 border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(10,84,177,0.3),rgba(255,255,255,0))]" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-6">
              <Link href="/" className="hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300">Legal</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-cyan-400 font-bold">Terms of Service</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
                  <Scale className="w-3.5 h-3.5" />
                  Official User Agreement • Effective September 2026
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
                  Terms of Service
                </h1>
                <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                  Please review these terms governing your access to the iFormat Personal Branding ecosystem, 
                  including our job marketplace, AI Career Assistant, ATS resume optimization, and corporate hiring suite.
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
                  Print Terms
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
            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0A54B1] flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Your Content Ownership</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                You retain 100% intellectual property rights over your personal resumes, CVs, and portfolio documents.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">AI Usage & Accuracy</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generative AI tools accelerate your career assets, but final submission approval rests in your hands.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Equal Opportunity</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Strict adherence to non-discriminatory, transparent hiring guidelines for all employer postings.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-200/80 hover:border-blue-400 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">Transparent Billing</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Secure PCI-compliant payment via Stripe with easy self-service subscription cancellation anytime.
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
                    <FileText className="w-4 h-4 text-[#0A54B1]" />
                    Table of Contents
                  </h4>
                  <nav className="space-y-1">
                    {SECTIONS.map((section) => (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        className={`block text-xs font-medium py-2 px-3 rounded-lg transition-colors ${
                          activeSection === section.id
                            ? "bg-blue-50 text-[#0A54B1] font-bold border-l-2 border-[#0A54B1]"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {section.title}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Privacy Switcher Box */}
                <div className="bg-linear-to-br from-blue-900 to-[#0A54B1] text-white rounded-2xl p-5 shadow-md">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Lock className="w-5 h-5 text-cyan-300" />
                    <h4 className="font-bold text-sm">Review Our Privacy Policy</h4>
                  </div>
                  <p className="text-xs text-blue-100 mb-4 leading-relaxed">
                    Learn how your career documents and authentication data are encrypted and protected.
                  </p>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0A54B1] text-xs font-bold hover:bg-cyan-50 transition-colors shadow-sm"
                  >
                    Read Privacy Policy
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Quick Support Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600">
                  <h5 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#0A54B1]" />
                    Have questions?
                  </h5>
                  <p className="mb-3 text-slate-500">
                    Our compliance and support desk is ready to help clarify any aspect of our terms.
                  </p>
                  <Link
                    href="/contact"
                    className="text-[#0A54B1] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    Contact Support Team <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </aside>

            {/* Content Article */}
            <article className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-10 border border-slate-200 shadow-sm space-y-12 text-slate-700 leading-relaxed text-sm md:text-base">
              {/* Introduction */}
              <div className="pb-6 border-b border-slate-100">
                <p className="text-slate-600 leading-relaxed">
                  These Terms of Service (&quot;<strong>Terms</strong>&quot;) constitute a legally binding agreement between you (&quot;<strong>User</strong>&quot;, &quot;<strong>you</strong>&quot;, or &quot;<strong>your</strong>&quot;) and <strong>iFormat Personal Branding</strong> (&quot;<strong>iFormat</strong>&quot;, &quot;<strong>we</strong>&quot;, &quot;<strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;). 
                  By accessing or using our websites (including <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">iformatbranding.com</code>, <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">api.iformatbranding.com</code>, and <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">ai.iformatbranding.com</code>), mobile-responsive applications, and associated services, you agree to be bound by these Terms.
                </p>
              </div>

              {/* Section 1 */}
              <section id="acceptance" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  1. Acceptance of Terms & Eligibility
                </h2>
                <p>
                  By creating an account, browsing public job listings, or utilizing our AI Career Assistant, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li>You are at least 18 years of age or the age of legal majority in your jurisdiction.</li>
                  <li>You have the legal authority and capacity to enter into these binding terms on behalf of yourself or the entity you represent.</li>
                  <li>Your use of our platform does not violate any applicable international, national, or local labor laws, employment regulations, or third-party rights.</li>
                </ul>
                <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/60 text-xs text-blue-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#0A54B1] shrink-0 mt-0.5" />
                  <div>
                    <strong>Important Notice:</strong> If you do not unconditionally agree to all terms and conditions set forth herein, you must immediately cease accessing or using all iFormat services.
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section id="accounts" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  2. Account Registration, Roles & Google OAuth
                </h2>
                <p>
                  iFormat offers specialized accounts for two distinct platform roles:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <h4 className="font-bold text-sm mb-1 text-[#0A54B1]">Candidate Accounts</h4>
                    <p className="text-xs text-slate-500">
                      Designed for professionals seeking career growth, resume generation, interview preparation, and job application submissions.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                    <h4 className="font-bold text-sm mb-1 text-cyan-700">Employer Accounts</h4>
                    <p className="text-xs text-slate-500">
                      Designed for companies, recruitment teams, and hiring managers to post verified job openings and review candidate talent pipelines.
                    </p>
                  </div>
                </div>
                <p>
                  You agree to provide true, accurate, and current information during registration. When utilizing <strong>Sign in with Google</strong> (Google OAuth 2.0), you authorize iFormat to receive your verified email, display name, and avatar URL to authenticate your session. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
                </p>
              </section>

              {/* Section 3 */}
              <section id="candidates" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  3. Candidate Services & AI Career Assistant
                </h2>
                <p>
                  Our proprietary AI career engine assists candidates with Applicant Tracking System (ATS) resume tailoring, keyword optimization, cover letter drafting, and job matching.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">
                      <strong>User Editorial Authority:</strong> AI-generated suggestions, bullets, and match scores are provided as assistive recommendations. You are solely responsible for verifying the truthfulness and accuracy of all information submitted on job applications.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">
                      <strong>No Guaranteed Employment:</strong> While our tools are engineered to maximize ATS match rates and interview invitations, iFormat does not guarantee job placement, interview offers, or salary levels.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-600">
                      <strong>Document Storage:</strong> Resumes and career documents are securely stored in AWS S3 and accessible strictly by you and employers to whom you explicitly submit applications.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section id="employers" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  4. Employer Services & Job Postings
                </h2>
                <p>
                  Employers posting vacancies on the iFormat Job Portal must abide by professional recruiting standards:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li><strong>Legitimate Job Listings:</strong> All posted vacancies must correspond to active, genuine employment or contractor opportunities. Phantom listings, commission-only multi-level marketing (MLM) schemes, and unpaid fee-requiring applications are strictly banned.</li>
                  <li><strong>Non-Discrimination:</strong> Postings must comply with international labor protections and must not discriminate based on race, gender, religion, national origin, disability, or age.</li>
                  <li><strong>Applicant Data Confidentiality:</strong> Candidate resumes, contact phone numbers, and portfolio links obtained through iFormat must be utilized exclusively for hiring consideration and must never be sold or shared with external marketing brokers.</li>
                </ul>
              </section>

              {/* Section 5 */}
              <section id="billing" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  5. Subscriptions, Payments & Refunds (Stripe)
                </h2>
                <p>
                  Certain premium features—including unlimited AI resume optimizations, priority employer applicant screening, and 1-on-1 career strategy consultations—require paid subscriptions or credits.
                </p>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs md:text-sm text-slate-600">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                    <CreditCard className="w-4 h-4 text-[#0A54B1]" />
                    Billing Terms Overview
                  </div>
                  <p>
                    <strong>Payment Gateway:</strong> All financial transactions are securely processed by Stripe, Inc. iFormat does not store your raw credit card or banking numbers on our servers.
                  </p>
                  <p>
                    <strong>Automatic Renewal:</strong> Subscriptions renew automatically on a recurring monthly or annual basis until canceled via your dashboard billing settings.
                  </p>
                  <p>
                    <strong>Cancellation & Refunds:</strong> You may cancel anytime to prevent future billing cycles. Because digital AI compute resources are allocated immediately upon generation, fees for past periods are non-refundable except where mandated by applicable consumer protection laws.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section id="intellectual-property" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  6. Intellectual Property & Content Ownership
                </h2>
                <p>
                  <strong>Your Content:</strong> You retain full title, ownership, and copyright over all text, work history, certificates, and logos you upload. By uploading content, you grant iFormat a non-exclusive, worldwide, royalty-free license solely to host, parse, format, and display your content as necessary to operate the service.
                </p>
                <p>
                  <strong>iFormat Property:</strong> The platform design, codebase, branding marks, logos, ATS algorithms, and proprietary prompts are the exclusive intellectual property of iFormat Personal Branding. You may not reverse engineer, decompile, or copy our underlying software without prior written consent.
                </p>
              </section>

              {/* Section 7 */}
              <section id="acceptable-use" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  7. Acceptable Use & Prohibited Conduct
                </h2>
                <p>Users must not engage in any of the following prohibited platform actions:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
                  <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/50 text-red-900 flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Automated scraping, bot querying, or bulk harvesting of candidate profiles or jobs.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/50 text-red-900 flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Uploading malicious files, Trojan horses, or infected PDF resume documents.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/50 text-red-900 flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Impersonating recruiters, hiring authorities, or existing commercial companies.</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/50 text-red-900 flex items-start gap-2">
                    <span className="text-red-500 font-bold">✕</span>
                    <span>Attempting unauthorized access to administrative portals or Redis rate-limit bypass.</span>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section id="suspension" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  8. Account Termination & Suspension
                </h2>
                <p>
                  We reserve the right to temporarily suspend or permanently terminate any candidate or employer account without liability if we reasonably determine that:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-600">
                  <li>You have breached any provision of these Terms or related community policies.</li>
                  <li>You have published fraudulent, misleading, or abusive employment or application materials.</li>
                  <li>Required by law enforcement, judicial order, or regulatory authorities.</li>
                </ul>
                <p>
                  You may delete your account at any time via your dashboard settings, which triggers data erasure pursuant to our Privacy Policy.
                </p>
              </section>

              {/* Section 9 */}
              <section id="disclaimers" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  9. Disclaimers & Limitation of Liability
                </h2>
                <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs md:text-sm text-amber-950 space-y-3">
                  <p className="font-semibold uppercase tracking-wider text-amber-900">
                    Warranty Disclaimer
                  </p>
                  <p>
                    THE IFORMAT SERVICES, INCLUDING ALL AI TOOLS AND CAREER RECOMMENDATIONS, ARE PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMISSIBLE BY APPLICABLE LAW, IFORMAT DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
                  </p>
                  <p className="font-semibold uppercase tracking-wider text-amber-900 pt-2">
                    Limitation of Liability
                  </p>
                  <p>
                    IN NO EVENT SHALL IFORMAT, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, PUNITIVE, OR SPECIAL DAMAGES (INCLUDING LOSS OF PROFITS, DATA, OR EMPLOYMENT OPPORTUNITIES) ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE PLATFORM.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section id="governing-law" className="scroll-mt-32 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#0A54B1]" />
                  10. Governing Law, Modifications & Contact
                </h2>
                <p>
                  <strong>Governing Jurisdiction:</strong> These Terms shall be governed by and construed in accordance with the laws of Bangladesh and applicable international digital commerce conventions, without regard to conflict of law principles.
                </p>
                <p>
                  <strong>Terms Updates:</strong> We reserve the right to modify these Terms periodically. Notice of material modifications will be provided via email or a platform banner prior to the effective date.
                </p>
                
                <div className="p-5 rounded-2xl bg-slate-900 text-white mt-6 space-y-3">
                  <h4 className="font-bold text-base flex items-center gap-2">
                    <Mail className="w-5 h-5 text-cyan-400" />
                    Questions or Legal Inquiries?
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300">
                    For inquiries concerning these Terms or platform policies, reach out to our legal and operations team:
                  </p>
                  <div className="pt-2 text-xs space-y-1 text-slate-400">
                    <p><strong className="text-white">Organization:</strong> iFormat Personal Branding & Career Network</p>
                    <p><strong className="text-white">Email:</strong> <a href="mailto:devamin.bd@gmail.com" className="text-cyan-400 hover:underline">devamin.bd@gmail.com</a> / <a href="mailto:support@iformatbranding.com" className="text-cyan-400 hover:underline">support@iformatbranding.com</a></p>
                    <p><strong className="text-white">Live Portal:</strong> <a href="https://iformatbranding.com" className="text-cyan-400 hover:underline">https://iformatbranding.com</a></p>
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
