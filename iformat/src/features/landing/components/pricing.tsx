"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { PricingHeader } from "./pricing-header";
import { PricingCard, PricingCardItem } from "./pricing-card";

const DEFAULT_BRANDING_PLANS: PricingCardItem[] = [
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    subtitle: "Maintain brand activity and engagement.",
    price: "$149",
    priceSuffix: "/month",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Job market advise",
    ],
  },
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    subtitle: "High-touch leadership advisory & brand authority",
    price: "$449",
    priceSuffix: "/month",
    isPopular: true,
    buttonText: "Get Started",
    features: [
      "Dedicated consultant",
      "1:1 Brand Strategy",
      "Recruiter Engagement",
      "Brand Updates/Edits",
      "Interview Coaching",
      "Salary Negotiation",
    ],
  },
  {
    code: "BRANDING_GROW",
    name: "Grow",
    subtitle: "For career pivoters and specialized Brand visibility and job market alignment",
    price: "$299",
    priceSuffix: "/package",
    isPopular: false,
    buttonText: "Get Started",
    features: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Recruiter messaging",
      "Quarterly LinkedIn Optimization",
    ],
  },
  {
    code: "BRANDING_ENTERPRISE",
    name: "Enterprise Solutions",
    subtitle: "Designed for career changers and niche pros to boost your brand and meet market needs",
    price: "",
    isPopular: false,
    buttonText: "Contact US",
    isContactUs: true,
    features: [
      "Executive Positioning & Thought Leadership",
      "Startup & Founder Brand Equity",
      "Stakeholder Brand Equity",
      "Investor Brand Engagement",
      "C-Suite Reputation Management",
      "Corporate Brand Advisory",
    ],
  },
];

export function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<PricingCardItem[]>(DEFAULT_BRANDING_PLANS);
  const [loadingPlanCode, setLoadingPlanCode] = useState<string | null>(null);

  const fetchDynamicPlans = useCallback(async () => {
    try {
      const data = await membershipService.getPlans();
      const rawPlans = Array.isArray(data) ? data : (data as any)?.plans;
      if (rawPlans && rawPlans.length > 0) {
        // Map dynamic plans if they match codes or IDs
        const updated = DEFAULT_BRANDING_PLANS.map((defaultPlan) => {
          const matched = rawPlans.find(
            (p: any) =>
              p.code === defaultPlan.code ||
              p.name.toLowerCase() === defaultPlan.name.toLowerCase()
          );
          if (matched) {
            return {
              ...defaultPlan,
              id: matched.id,
              price: matched.priceInCents > 0 ? `$${matched.priceInCents / 100}` : defaultPlan.price,
              features:
                Array.isArray(matched.customFeatures) && matched.customFeatures.length > 0
                  ? matched.customFeatures
                  : defaultPlan.features,
            };
          }
          return defaultPlan;
        });
        setPlans(updated);
      }
    } catch {
      // Use defaults seamlessly
      setPlans(DEFAULT_BRANDING_PLANS);
    }
  }, []);

  useEffect(() => {
    fetchDynamicPlans();
  }, [fetchDynamicPlans]);

  const handleSelectPlan = async (item: PricingCardItem) => {
    if (item.isContactUs) {
      router.push("/contact");
      return;
    }

    if (!isAuthenticated) {
      router.push(`/signup?plan=${encodeURIComponent(item.code)}`);
      return;
    }

    try {
      setLoadingPlanCode(item.code);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await membershipService.createCheckoutSession({
        planId: item.id || item.code,
        successUrl: `${origin}/dashboard?payment=success`,
        cancelUrl: `${origin}/#pricing`,
      });

      if (res?.url) {
        window.location.href = res.url;
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to initiate subscription checkout.";
      toast.error(errorMsg);
    } finally {
      setLoadingPlanCode(null);
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-14">
        <PricingHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((item) => (
            <div key={item.code} className="flex">
              <PricingCard
                item={item}
                loading={loadingPlanCode === item.code}
                onSelect={handleSelectPlan}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
