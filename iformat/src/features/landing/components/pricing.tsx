"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
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

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-16">
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPlans.map((plan, index) => (
              <PricingCard
                key={plan.id ? `plan-${plan.id}` : `plan-${plan.code || "tier"}-${index}`}
                plan={plan}
                billingInterval={billingInterval}
                loadingPlanId={loadingPlanId}
                onSelectPlan={handleSelectPlan}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
