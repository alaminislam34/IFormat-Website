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

import { SERVICES_DATA } from "@/features/services/data/services-data";


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
