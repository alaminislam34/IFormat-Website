"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Eye,
  Clock,
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
} from "lucide-react";
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
import { AuthPromptModal } from "@/components/auth/auth-prompt-modal";
import { getMediaUrl } from "@/lib/utils";

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
              className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm h-115 flex flex-col animate-pulse"
            >
              <div className="h-52 bg-slate-200" />
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-3/4 rounded-md bg-slate-200" />
                  <Skeleton className="h-4 w-full rounded-md bg-slate-200" />
                  <Skeleton className="h-4 w-2/3 rounded-md bg-slate-200" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Skeleton className="h-8 w-20 rounded-md bg-slate-200" />
                  <Skeleton className="h-8 w-24 rounded-xl bg-slate-200" />
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
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
    if (!isAuthenticated) {
      setIsDetailModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }
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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        title="Sign In to Order Package"
        description={`Sign in or create a free account to order ${selectedProduct?.title || "this career service"}.`}
        redirectUrl="/#services"
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsOrderModalOpen(true);
        }}
      />

      <div className="max-w-360 mx-auto w-11/12">
        <ScrollReveal yOffset={40}>
          <SectionHeader
            title="Individual Services"
            description="Thoughtfully designed solutions, to over serve clients, delivered through collaborative partnerships that prioritize your goals, experience, and long-term success."
            maxWidth="max-w-3xl"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {featuredServices.map((service, idx) => {
            const mediaUrl = getMediaUrl(service.image);
            const hasValidImage = Boolean(mediaUrl && mediaUrl.trim() !== "");

            return (
              <ScrollReveal key={service.id || idx} yOffset={30} delay={idx * 0.1}>
                <div
                  onClick={() => handleOpenDetail(service)}
                  className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-lg transition-all group h-full flex flex-col cursor-pointer relative"
                >
                  <div className="h-52 overflow-hidden relative bg-slate-900">
                    {hasValidImage ? (
                      <Image
                        src={mediaUrl}
                        alt={service.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-[#004AAD] via-[#002868] to-slate-950 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-radial from-cyan-400/20 via-transparent to-transparent pointer-events-none" />
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-2 shadow-inner">
                          <ShoppingBag className="w-7 h-7 text-cyan-300" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-200/90 line-clamp-1">
                          {service.category}
                        </span>
                      </div>
                    )}
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
