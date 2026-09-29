"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, Clock, CheckCircle2, Calendar, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/use-auth-store";
import { useServicesStore } from "@/stores/use-services-store";
import {
  ProductDetailModal,
  ServiceProduct,
} from "@/features/services/components/product-detail-modal";
import { OrderServiceModal } from "@/features/services/components/order-service-modal";

function ServicesSkeleton() {
  return (
    <section className="py-24 bg-white overflow-hidden" id="services">
      <div className="max-w-360 mx-auto w-11/12">
        <div className="max-w-2xl mx-auto text-center mb-12 space-y-3">
          <Skeleton className="h-9 w-64 mx-auto rounded-xl bg-slate-200" />
          <Skeleton className="h-5 w-80 mx-auto rounded-lg bg-slate-200" />
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm h-105 flex flex-col animate-pulse"
            >
              <div className="h-52 bg-slate-200" />
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200" />
                  <Skeleton className="h-4 w-full rounded-md bg-slate-200" />
                  <Skeleton className="h-4 w-2/3 rounded-md bg-slate-200" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Skeleton className="h-7 w-20 rounded-md bg-slate-200" />
                  <Skeleton className="h-9 w-28 rounded-xl bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { services, isHydrated, isLoading, syncWithBackend } = useServicesStore();
  const [selectedProduct, setSelectedProduct] = useState<ServiceProduct | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    syncWithBackend();
  }, [syncWithBackend]);

  // Display top 3 active featured services on landing page
  const featuredServices = useMemo(() => {
    return services.filter((s) => s.isActive !== false).slice(0, 3);
  }, [services]);

  const handleOpenDetail = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setIsDetailModalOpen(true);
  };

  const handleOrderNow = (product: ServiceProduct) => {
    setSelectedProduct(product);
    setIsOrderModalOpen(true);
    setIsDetailModalOpen(false);
  };

  if (!isHydrated || isLoading) {
    return <ServicesSkeleton />;
  }

  return (
    <section className="py-24 bg-white overflow-hidden" id="services">
      {/* Product Detail Modal */}
      <ProductDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        product={selectedProduct}
        onOrderNow={handleOrderNow}
        onBookConsultation={handleOrderNow}
      />

      {/* Order Service Modal */}
      <OrderServiceModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        service={selectedProduct}
      />

      <div className="max-w-360 mx-auto w-11/12">
        <ScrollReveal yOffset={40}>
          <SectionHeader
            title="Individual Services"
            description="A la carte options to boost your professional toolkit."
            maxWidth="max-w-2xl"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredServices.map((service, idx) => {
            const hasValidImage =
              service.image &&
              !service.image.includes("images.unsplash.com") &&
              service.image.trim() !== "";

            return (
              <ScrollReveal key={service.id || idx} yOffset={40} delay={idx * 0.15}>
                <div
                  onClick={() => handleOpenDetail(service)}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-cyan-300 transition-all group h-full flex flex-col cursor-pointer"
                >
                  <div className="h-52 overflow-hidden relative bg-slate-900">
                    {hasValidImage ? (
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        unoptimized={service.image?.startsWith("http") || service.image?.startsWith("data:")}
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#0A54B1] via-[#052b5b] to-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-radial from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 shadow-inner">
                          <ShoppingBag className="w-7 h-7 text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200/90 line-clamp-1">
                          {service.category}
                        </span>
                      </div>
                    )}
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
                        <ShoppingBag className="w-3.5 h-3.5 text-[#0A54B1]" /> Order Package
                      </button>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
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
