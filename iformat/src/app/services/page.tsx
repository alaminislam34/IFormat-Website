"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { useServicesStore } from "@/stores/use-services-store";
import {
  Brain,
  Layout,
  FileText,
  TrendingUp,
  Sparkles,
  ShoppingBag,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader, GradientText } from "@/components/ui/section-header";
import { OrderServiceModal } from "@/features/services/components/order-service-modal";
import {
  ProductDetailModal,
  ServiceProduct,
} from "@/features/services/components/product-detail-modal";

export default function ServicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const services = useServicesStore((state) => state.services);
  const activeServices = useMemo(() => {
    return services.filter((s) => s.isActive !== false);
  }, [services]);
  const [selectedProduct, setSelectedProduct] = useState<ServiceProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const handleOpenDetail = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOrderNow = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const features = [
    {
      title: "Psycholinguistics & NLP",
      desc: "We have used psycholinguistic techniques to establish a writing methodology along with Neuro-Linguistic Programming.",
      icon: <Brain className="w-5 h-5 text-white" />,
    },
    {
      title: "ATS – Applicant Tracking Software",
      desc: "Creating the most ATS Compliant profiles navigating to the top of recruitment and expert searches.",
      icon: <FileText className="w-5 h-5 text-white" />,
    },
    {
      title: "ROI – Return On Investment",
      desc: "Show the experts how you have positively impacted your role, the department, a business or a country.",
      icon: <TrendingUp className="w-5 h-5 text-white" />,
    },
    {
      title: "Concise Writing",
      desc: "Wordy writing dilutes the impact of your message, concise writing, instead, helps grab and hold your reader’s attention, it is one of the most desirable leadership characteristics.",
      icon: <Sparkles className="w-5 h-5 text-white" />,
    },
    {
      title: "Easy Eye Movement",
      desc: "Our job is to place information in such a way it is easily found by rapid eye movements through the use of saccades and maximizing saccades, a type of eye movement.",
      icon: <Eye className="w-5 h-5 text-white" />,
    },
    {
      title: "Layout Elegance",
      desc: "Elegant, clean, and unobstructed layout focusing only on what we believe to be the most important thing, your legacy, history and content.",
      icon: <Layout className="w-5 h-5 text-white" />,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-20">
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onOrderNow={handleOrderNow}
        onBookConsultation={handleOrderNow}
      />

      <OrderServiceModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        service={selectedProduct}
      />

      <section className="pt-8 pb-20 w-full">
        <div className="max-w-360 mx-auto w-11/12">
          <ScrollReveal>
            <SectionHeader
              as="h1"
              title={
                <>
                  Individual <GradientText>Services</GradientText>
                </>
              }
              description="Choose from tailored services designed to enhance your career skills."
              className="mb-12"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeServices.map((service, idx) => (
            <ScrollReveal key={service.id} yOffset={30} delay={idx * 0.05}>
              <div
                onClick={() => handleOpenDetail(service)}
                className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group h-full flex flex-col cursor-pointer relative"
              >
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
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-linear-to-r from-[#5DE0E6] to-[#004AAD] text-white shadow-sm">
                        {service.badge}
                      </span>
                    )}
                  </div>

                  {/* View Details pill on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
                    <span className="px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#004AAD]" /> View Full Details & Specs
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
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#004AAD] transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {service.tagline}
                  </p>

                  <div className="space-y-1.5 mb-6 flex-1">
                    {service.deliverables.slice(0, 2).map((del, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-[11px] text-slate-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetail(service);
                      }}
                      className="text-xs font-bold text-slate-700 hover:text-[#004AAD] bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" /> Details
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderNow(service);
                      }}
                      className="text-xs font-extrabold text-white bg-linear-to-r from-[#5DE0E6] to-[#004AAD] hover:opacity-95 px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Order Service
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
      </section>

      {/* Unique Methodology Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-360 mx-auto w-11/12">
          <ScrollReveal>
            <SectionHeader
              title={
                <>
                  What makes <GradientText>iFormat</GradientText> Branding unique
                </>
              }
              description="We have developed a unique writing methodology that modern AI tools cannot replicate. This is because we have integrated a psycholinguistic technique into our writing, which effectively stimulates interest and shapes perceptions, creating a compelling personal brand, this is done through;"
            />
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <ScrollReveal key={idx} yOffset={30} delay={idx * 0.08}>
                <div className="group bg-[#f0f7fa] hover:bg-white rounded-3xl p-8 text-center h-full hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 border border-blue-50 hover:border-blue-200 relative flex flex-col items-center">
                  <div className="w-12 h-12 bg-linear-to-br from-[#5DE0E6] to-[#004AAD] rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#004AAD] transition-colors mb-3">
                    {feature.title}
                  </h3>
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
