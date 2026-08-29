"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { PlanDTO } from "@/types/api";
import { PricingHeader } from "./pricing-header";
import { PricingCard } from "./pricing-card";

export function Pricing() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const [audience, setAudience] = useState<"EMPLOYER" | "CANDIDATE">("EMPLOYER");
  const [billingInterval, setBillingInterval] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  // Slider State
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    // If logged in, automatically default to user's role
    const roleUpper = user?.role?.toUpperCase();
    if (roleUpper === "CANDIDATE") {
      setAudience("CANDIDATE");
    } else if (roleUpper === "EMPLOYER") {
      setAudience("EMPLOYER");
    }
  }, [user]);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipService.getPlans();
      if (data) {
        setPlans(Array.isArray(data) ? data : (data as any).plans || []);
      }
    } catch (err: any) {
      const msg = err?.message || "Could not load dynamic pricing plans.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSelectPlan = async (plan: PlanDTO) => {
    if (plan.priceInCents === 0) {
      if (!isAuthenticated) {
        router.push("/signup");
      } else {
        router.push(audience === "EMPLOYER" ? "/job-portal" : "/job-assistant");
      }
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(`/services?selectedPlan=${plan.code}#pricing`)}`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const session = await membershipService.createCheckoutSession({
        planId: plan.id,
        successUrl: `${origin}/dashboard/billing?payment=success`,
        cancelUrl: `${origin}/services?payment=cancelled#pricing`,
      });

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to initiate Stripe Checkout session.");
    } finally {
      setLoadingPlanId(null);
    }
  };

  // Filter plans based on active audience tab
  const filteredPlans = plans.filter(
    (p) => p.targetAudience === audience || p.targetAudience === "BOTH"
  );

  // Update slider navigation buttons status
  const updateScrollState = useCallback(() => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    // Estimate active index based on card width
    const cardWidth = 380 + 32; // card width + gap
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, filteredPlans.length - 1));
  }, [filteredPlans.length]);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState, filteredPlans]);

  const slideTo = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = 400;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const slideToIndex = (index: number) => {
    if (!sliderRef.current) return;
    const cardWidth = 380 + 32;
    sliderRef.current.scrollTo({
      left: index * cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        <PricingHeader
          audience={audience}
          setAudience={setAudience}
          billingInterval={billingInterval}
          setBillingInterval={setBillingInterval}
        />

        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : error || filteredPlans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pricing Catalog Updating</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              We are currently refreshing our dynamic subscription tiers. You can still access standard starter features or retry fetching the catalog.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() =>
                  router.push(
                    isAuthenticated
                      ? audience === "EMPLOYER"
                        ? "/job-portal"
                        : "/job-assistant"
                      : "/signup"
                  )
                }
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold h-10 px-6 rounded-xl"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                onClick={fetchPlans}
                className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 text-xs h-10 px-4 rounded-xl"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Slider Navigation Header Controls */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {filteredPlans.length} {filteredPlans.length === 1 ? "Plan" : "Plans"} Available • Slide to compare
              </span>

              {/* Slider Arrows */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => slideTo("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous plan"
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => slideTo("right")}
                  disabled={!canScrollRight}
                  aria-label="Next plan"
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Pricing Cards Slider (No Auto-Slide, Smooth Manual Drag/Scroll) */}
            <div
              ref={sliderRef}
              className="flex items-stretch gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-2 scrollbar-none"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredPlans.map((plan, index) => (
                <div
                  key={plan.id ? `plan-${plan.id}` : `plan-${plan.code || "tier"}-${index}`}
                  className="snap-center shrink-0 w-full sm:w-[380px] md:w-[400px] flex"
                >
                  <div className="w-full flex">
                    <PricingCard
                      plan={plan}
                      billingInterval={billingInterval}
                      loadingPlanId={loadingPlanId}
                      onSelectPlan={handleSelectPlan}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Slider Pagination Dots */}
            {filteredPlans.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                {filteredPlans.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => slideToIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      activeIndex === idx
                        ? "w-8 bg-[#0A54B1]"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
