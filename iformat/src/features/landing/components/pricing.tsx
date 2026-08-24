"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        const data = await membershipService.getPlans();
        if (data) {
          setPlans(Array.isArray(data) ? data : (data as any).plans || []);
        }
      } catch (err) {
        console.warn("Could not load dynamic plans, using fallback state:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

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
      router.push(`/login?redirect=/services#pricing&selectedPlan=${plan.code}`);
      return;
    }

    try {
      setLoadingPlanId(plan.id);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const session = await membershipService.createCheckoutSession({
        planId: plan.id,
        successUrl: `${origin}/dashboard/billing?payment=success`,
        cancelUrl: `${origin}/services#pricing?payment=cancelled`,
      });

      if (session?.url) {
        window.location.href = session.url;
      }
    } catch (err: any) {
      alert(err.message || "Failed to initiate Stripe Checkout session.");
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
