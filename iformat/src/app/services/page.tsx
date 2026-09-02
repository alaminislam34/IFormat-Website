"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  Calendar,
  Brain,
  Layout,
  FileText,
  Move,
  TrendingUp,
  Sparkles,
  ArrowRight,
  UserCheck,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";
import {
  ProductDetailModal,
  ServiceProduct,
} from "@/features/services/components/product-detail-modal";
import { Button } from "@/components/ui/button";

const SERVICES_DATA: ServiceProduct[] = [
  {
    id: "personal-brand-builder",
    title: "Personal Brand Builder",
    price: "$199",
    priceNum: 199,
    deliveryTime: "3-5 Business Days",
    category: "Executive Suite",
    badge: "Most Popular",
    tagline: "Comprehensive end-to-end professional repositioning for market authority.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    description:
      "Transform your professional presence across all digital touchpoints. Our senior brand architects craft a high-impact narrative that positions you as a leading domain authority to recruiters, investors, and executive search firms.",
    deliverables: [
      "1-on-1 Deep-Dive Executive Positioning Interview",
      "Bespoke ATS-Optimized Master Executive CV",
      "Full LinkedIn Profile Architecture & Bio Re-write",
      "Custom Value Proposition & Elevator Pitch",
      "Editable Word, PDF & Cloud Dashboard Access",
    ],
    audience: "Senior Managers, Directors, VPs, and Leaders seeking significant career elevation.",
    methodology: "Blends Psycholinguistic Narrative Frameworks with proprietary ATS Keyword Topology.",
  },
  {
    id: "strategic-branding",
    title: "Strategic Corporate & Founder Branding",
    price: "$249",
    priceNum: 249,
    deliveryTime: "4-6 Business Days",
    category: "Founders & C-Suite",
    badge: "Premium",
    tagline: "High-stakes executive branding for founders, partners, and enterprise executives.",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
    description:
      "Engineered for founders and C-Suite leaders whose personal reputation directly impacts business valuation, stakeholder trust, and media presence. Establishes indisputable industry authority.",
    deliverables: [
      "Full Executive Bio & One-Page Speaker Sheet",
      "Thought Leadership Content Strategy & Post Templates",
      "Board & Investor-Facing Executive Resume",
      "Strategic Media & PR Outreach Messaging Blueprint",
      "Priority Strategy Consultation Session",
    ],
    audience: "Founders, CEOs, Board Members, Managing Partners, and Enterprise Leaders.",
    methodology: "Neuro-Linguistic Framing combined with Corporate Stakeholder Perception Mapping.",
  },
  {
    id: "career-hosting-package",
    title: "Career Hosting & Portfolio Package",
    price: "$129",
    priceNum: 129,
    deliveryTime: "2-4 Business Days",
    category: "Digital Assets",
    tagline: "A live, interactive digital portfolio showcasing your verified career milestones.",
    image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&q=80&w=800",
    description:
      "Stand out in competitive recruitment pipelines with a dedicated, custom-branded career microsite. Host your case studies, certifications, recommendations, and executive metrics.",
    deliverables: [
      "Personalized Live Web Portfolio Link & QR Code",
      "Interactive Case Study & Project Showcase",
      "Integrated 1-Click Meeting Scheduler for Recruiters",
      "Real-time Analytics on Recruiter Views & Downloads",
      "1-Year High-Speed Cloud Hosting Included",
    ],
    audience: "Product Leaders, Technical Architects, Consultants, and Creative Executives.",
    methodology: "High-conversion UX design optimized for fast recruiter scanning and mobile viewing.",
  },
  {
    id: "ats-compliant-cv",
    title: "ATS-Compliant Precision CV",
    price: "$89",
    priceNum: 89,
    deliveryTime: "48 Hours",
    category: "Resume Engineering",
    badge: "Best Value",
    tagline: "Scientifically engineered to score 98%+ on Taleo, Workday, Greenhouse & Lever.",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=800",
    description:
      "Eliminate the black hole of online applications. Our ATS specialists reformat, restructure, and optimize your resume typography, hierarchy, and keywords to pass all modern enterprise tracking bots.",
    deliverables: [
      "Dual-Column & Single-Column ATS Clean Architecture",
      "Industry-Targeted Keyword Density Alignment",
      "Metric-Driven Action Verbs & Achievement Re-framing",
      "ATS Compatibility Audit Report (98%+ Pass Guarantee)",
      "Editable DOCX, LaTeX, and Vector PDF Formats",
    ],
    audience: "Professionals actively applying to competitive enterprise and multinational job postings.",
    methodology: "Benchmarked against top 15 global Applicant Tracking Software parsing engines.",
  },
  {
    id: "cover-letters",
    title: "High-Conversion Cover Letter Suite",
    price: "$49",
    priceNum: 49,
    deliveryTime: "24-48 Hours",
    category: "Application Suite",
    tagline: "Compelling storytelling letters that grab hiring managers within the first 6 seconds.",
    image: "https://images.unsplash.com/photo-1512429234305-12fe5b0b0fbf?auto=format&fit=crop&q=80&w=800",
    description:
      "Move beyond generic templates. Receive a tailored, modular cover letter framework designed to showcase your unique value proposition, cultural fit, and immediate business impact.",
    deliverables: [
      "3 Modular Letter Variants (Direct, Networking, Headhunter)",
      "Psycholinguistic Hook & Value Bridge",
      "Customizable Dynamic Paragraph Placeholders",
      "Matching Visual Styling with your iFormat CV",
    ],
    audience: "Job seekers aiming to stand out and explain transitions, relocations, or promotions.",
    methodology: "Persuasive communication structures that trigger subconscious recruiter curiosity.",
  },
  {
    id: "templated-cv-management",
    title: "Multi-Role CV Versioning Suite",
    price: "$79",
    priceNum: 79,
    deliveryTime: "2-3 Business Days",
    category: "Career Agility",
    tagline: "Tailor your application profile for different industries, niches, or dual career paths.",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=800",
    description:
      "Don't apply with a one-size-fits-all CV. We create 2 tailored resume variations targeting distinct industry sub-domains or dual specialties (e.g., Engineering Lead vs. Product Architect).",
    deliverables: [
      "2 Distinct Targeted Resume Variants",
      "Role-Specific Highlight Matrices & Metric Emphasis",
      "Cloud Version Synchronization & Quick Switching",
      "Guidance Checklist on which version to deploy",
    ],
    audience: "Multi-disciplinary professionals, career switchers, and dual-competency leaders.",
    methodology: "Segmented competency alignment for distinct recruiter persona matching.",
  },
  {
    id: "ceo-biography",
    title: "Executive & CEO Biography",
    price: "$159",
    priceNum: 159,
    deliveryTime: "3-5 Business Days",
    category: "Executive Suite",
    tagline: "Narrative authority piece crafted for board appointments, keynotes, and press.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    description:
      "A polished, third-person narrative capturing your leadership journey, notable governance achievements, philosophical insights, and industry impact. Ready for press releases and media kits.",
    deliverables: [
      "Full-Length Narrative Executive Biography (600-800 words)",
      "Shortened Media/Panel Introduction Blurb (150 words)",
      "Executive Summary Sheet for Board & Advisory Inquiries",
      "Full Media Rights & Copyright Clearance",
    ],
    audience: "Chief Executives, Board Candidates, Keynote Speakers, and Advisory Council Members.",
    methodology: "Journalistic narrative arcs blended with executive thought leadership frameworks.",
  },
  {
    id: "interview-coaching",
    title: "1-on-1 Executive Interview Masterclass",
    price: "$149",
    priceNum: 149,
    deliveryTime: "60-Min Live Session",
    category: "Live Advisory",
    badge: "1-on-1 Live",
    tagline: "Intensive mock interview simulation and behavioral response calibration.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    description:
      "Practice high-stakes interview scenarios with seasoned hiring consultants. Master the STAR-L methodology, salary negotiations, executive presence, and tough competency questions.",
    deliverables: [
      "60-Minute Private Video Coaching Session",
      "Personalized Target Role Mock Interview Simulation",
      "Detailed Strengths & Improvement Scorecard",
      "Compensation & Package Negotiation Playbook",
      "Full Session Video Recording & Transcript",
    ],
    audience: "Candidates preparing for final-round executive, partner, or technical leadership panels.",
    methodology: "Psychological stress-testing and behavioral verbal impact calibration.",
  },
  {
    id: "monthly-support",
    title: "Monthly Dedicated Career Concierge",
    price: "$99",
    priceNum: 99,
    deliveryTime: "Ongoing Monthly",
    category: "Continuous Advisory",
    tagline: "Continuous on-demand resume tuning, cover letter drafting, and job portal strategy.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800",
    description:
      "Your personal career advisor on retainer. Get unlimited quick CV adjustments for specific target openings, custom cover letters on demand, and strategic job application advice every week.",
    deliverables: [
      "Up to 4 Custom Application Tailorings per Month",
      "Priority Turnaround (24-hour delivery on requests)",
      "Direct Messaging Access to your Dedicated Brand Architect",
      "Bi-Weekly Application Pipeline Review & Analytics",
      "Cancel or pause anytime with 1 click",
    ],
    audience: "Active executive job seekers in high-velocity application cycles.",
    methodology: "Agile career iteration with continuous feedback loops.",
  },
];

export default function ServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<ServiceProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [consultationTitle, setConsultationTitle] = useState("1-on-1 Strategy Consultation");

  const handleOpenDetail = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOpenBooking = (serviceTitle: string) => {
    setConsultationTitle(serviceTitle);
    setIsBookingModalOpen(true);
  };

  const handleOrderNow = (product: ServiceProduct) => {
    if (!isAuthenticated) {
      toast.info(`Please sign in or create an account to checkout ${product.title}.`);
      router.push(`/signup?redirect=${encodeURIComponent("/dashboard/billing")}`);
      return;
    }
    toast.success(`Redirecting to checkout for ${product.title}...`);
    router.push(`/dashboard/billing?service=${encodeURIComponent(product.id)}`);
  };

  const features = [
    {
      title: "Psycholinguistics & NLP",
      desc: "We deploy psycholinguistic techniques to establish an authoritative writing methodology along with Neuro-Linguistic Programming to stimulate recruiter curiosity.",
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    {
      title: "ATS Precision Engineering",
      desc: "Creating the most ATS-compliant profiles that navigate to the top of recruiter searches with 98%+ verified parsing rates.",
      icon: <FileText className="w-5 h-5 text-white" />,
    },
    {
      title: "Personal Brand Architecture",
      desc: "Highlighting unique executive strengths to build an authentic, memorable presence that commands higher market value.",
      icon: <Layout className="w-5 h-5 text-white" />,
    },
    {
      title: "Elevated Career Transitions",
      desc: "Crafting narratives that bridge experience across industries, helping professionals pivot seamlessly into higher-tier roles.",
      icon: <Move className="w-5 h-5 text-white" />,
    },
    {
      title: "Executive Thought Leadership",
      desc: "Positioning founders and executives with speaking topics, publications, and LinkedIn strategies that attract capital and opportunities.",
      icon: <TrendingUp className="w-5 h-5 text-white" />,
    },
    {
      title: "Live 1-on-1 Expert Calibration",
      desc: "Direct advisory sessions with seasoned talent partners to refine your pitch, interview technique, and compensation leverage.",
      icon: <UserCheck className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-24">
      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onOrderNow={handleOrderNow}
        onBookConsultation={(prod) => handleOpenBooking(prod.title)}
      />

      {/* Book Consultation Modal */}
      <BookConsultationModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceTitle={consultationTitle}
      />

      {/* Hero Header */}
      <section className="bg-linear-to-b from-white to-slate-50 border-b border-slate-100 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <ScrollReveal>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-blue-50 text-[#0A54B1] border border-blue-100 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Professional Solutions & Advisory
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
              Executive Products & <span className="text-[#0A54B1]">Strategic Advisory</span>
            </h1>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8">
              Explore our tailored career engineering products, ATS-beating resumes, and 1-on-1 executive advisory sessions. Click any product to view deliverables or book an instant consultation.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => handleOpenBooking("1-on-1 Career Strategy Consultation")}
                className="px-7 py-3.5 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Book a Free Consultation <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                href="/job-assistant"
                className="px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-sm hover:bg-slate-100 transition-colors shadow-sm"
              >
                Try AI Job Assistant
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Services & Products Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6 md:px-8 w-full">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES_DATA.map((service, idx) => (
            <ScrollReveal key={service.id} yOffset={30} delay={idx * 0.05}>
              <div
                onClick={() => handleOpenDetail(service)}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group h-full flex flex-col cursor-pointer relative"
              >
                {/* Image & Badges */}
                <div className="h-52 overflow-hidden relative bg-slate-900">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-900 shadow-sm">
                      {service.category}
                    </span>
                    {service.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#0A54B1] text-white shadow-sm">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* View Details pill on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <span className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#0A54B1]" /> View Full Details & Specs
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 text-slate-200 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-cyan-300" /> {service.deliveryTime}
                    </span>
                    <span className="text-xl font-black text-white">{service.price}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {service.tagline}
                  </p>

                  {/* Key deliverable previews */}
                  <div className="space-y-1.5 mb-6 flex-1">
                    {service.deliverables.slice(0, 2).map((del, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBooking(service.title);
                      }}
                      className="text-xs font-bold text-slate-700 hover:text-[#0A54B1] bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#0A54B1]" /> Book Session
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderNow(service);
                      }}
                      className="text-xs font-extrabold text-white bg-[#0A54B1] hover:bg-[#08428C] px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Order Now
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Unique Methodology Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A54B1] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Proprietary Approach
              </span>
              <h2 className="text-3xl md:text-4xl font-black mt-3 mb-6 text-slate-900 tracking-tight">
                What Makes <span className="text-[#0A54B1]">iFormat</span> Branding Unique
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                We have developed a signature methodology that generic AI tools cannot replicate. By integrating psycholinguistics, cognitive perception mapping, and ATS software reverse-engineering, we establish lasting authority for your personal brand.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <ScrollReveal key={idx} yOffset={30} delay={idx * 0.08}>
                <div className="bg-[#f0f7fa] rounded-3xl p-8 text-center h-full hover:shadow-lg transition-all border border-blue-50">
                  <div className="w-12 h-12 bg-[#0A54B1] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md shadow-blue-500/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
