"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, Clock, CheckCircle2, Calendar, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useAuthStore } from "@/stores/use-auth-store";
import {
  ProductDetailModal,
  ServiceProduct,
} from "@/features/services/components/product-detail-modal";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";
import { SERVICES_DATA } from "@/features/services/data/services-data";

export function Services() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [selectedProduct, setSelectedProduct] = useState<ServiceProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [consultationTitle, setConsultationTitle] = useState("1-on-1 Career Strategy Consultation");

  // Display top 3 featured services on landing page
  const featuredServices = SERVICES_DATA.slice(0, 3);

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
      toast.info(`Please sign in or create an account to purchase ${product.title}.`);
      router.push(`/signup?redirect=${encodeURIComponent("/dashboard/billing")}`);
      return;
    }
    toast.success(`Redirecting to checkout for ${product.title}...`);
    router.push(`/dashboard/billing?service=${encodeURIComponent(product.id)}`);
  };

  return (
    <section className="py-24 bg-white overflow-hidden" id="services">
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

      <div className="max-w-7xl mx-auto px-8">
        <ScrollReveal yOffset={40}>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Individual Services</h2>
            <p className="text-slate-600">
              A la carte options to boost your professional toolkit.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredServices.map((service, idx) => (
            <ScrollReveal key={service.id || idx} yOffset={40} delay={idx * 0.15}>
              <div
                onClick={() => handleOpenDetail(service)}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all group h-full flex flex-col cursor-pointer"
              >
                <div className="h-52 overflow-hidden relative bg-slate-900">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  {/* Badge */}
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

                  {/* Hover Quick Preview Pill */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/30 backdrop-blur-xs">
                    <span className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-[#0A54B1]" /> View Details
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs">
                    <span className="flex items-center gap-1 text-slate-200 font-semibold text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-cyan-300" /> {service.deliveryTime}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0A54B1] transition-colors mb-2">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">
                    {service.tagline}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-2xl font-bold text-brand-cyan">{service.price}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOrderNow(service);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#0A54B1] hover:text-[#08428C] bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal yOffset={20} delay={0.4}>
          <div className="text-center">
            <Link
              href="/services"
              className="inline-flex items-center gap-1 text-brand-cyan font-semibold hover:text-cyan-600 hover:underline underline-offset-4 transition-colors"
            >
              See More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
