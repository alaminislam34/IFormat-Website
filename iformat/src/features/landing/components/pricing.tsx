"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { membershipService } from "@/services/membership.service";
import { useAuthStore } from "@/stores/use-auth-store";
import { UserSubscriptionDetailsDTO } from "@/types/api";
import { PricingHeader } from "./pricing-header";
import { PricingCard, PricingCardItem } from "./pricing-card";
import { SubscriptionPhoneModal } from "@/features/billing/components/subscription-phone-modal";

export const DEFAULT_BRANDING_PLANS: PricingCardItem[] = [
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
      "Outplacement Support",
      "Startup Brand Equity",
      "Stakeholder Brand Equity",
      "Investor Brand Engagement",
      "Restructuring",
      "Workforce Transitions",
    ],
  },
];

export function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [plans, setPlans] = useState<PricingCardItem[]>(DEFAULT_BRANDING_PLANS);
  const [loadingPlanCode, setLoadingPlanCode] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscriptionDetailsDTO | null>(null);

  const fetchDynamicPlans = useCallback(async () => {
    try {
      const data = await membershipService.getPlans();
      const rawPlans = Array.isArray(data) ? data : (data as any)?.plans;
      if (rawPlans && rawPlans.length > 0) {
        const updated = DEFAULT_BRANDING_PLANS.map((defaultPlan) => {
          const matched = rawPlans.find(
            (p: any) =>
              p.code === defaultPlan.code ||
              p.name.toLowerCase() === defaultPlan.name.toLowerCase()
          );
          if (matched) {
            const rawFeat = matched.customFeatures as any;
            const customList = Array.isArray(rawFeat) && rawFeat.length > 0
              ? rawFeat
              : Array.isArray(rawFeat?.features) && rawFeat.features.length > 0
              ? rawFeat.features
              : null;

            return {
              ...defaultPlan,
              id: matched.id,
              price: matched.priceInCents > 0 ? `$${matched.priceInCents / 100}` : defaultPlan.price,
              features: customList || defaultPlan.features,
            };
          }
          return defaultPlan;
        });
        setPlans(updated);
      }
    } catch {
      setPlans(DEFAULT_BRANDING_PLANS);
    }
  }, []);

  useEffect(() => {
    fetchDynamicPlans();
  }, [fetchDynamicPlans]);

  useEffect(() => {
    if (isAuthenticated) {
      membershipService
        .getUserSubscription()
        .then((sub) => {
          if (sub) setSubscription(sub);
        })
        .catch((err) => {
          console.warn("Could not fetch user subscription on pricing section:", err?.message);
        });
    } else {
      setSubscription(null);
    }
  }, [isAuthenticated]);

  const isPaidActive = Boolean(
    subscription &&
      subscription.isPaidActive &&
      subscription.plan &&
      subscription.plan.priceInCents > 0 &&
      (subscription.status === "ACTIVE" || subscription.subscription?.status === "ACTIVE")
  );

  const currentPlan = isPaidActive ? subscription?.plan : null;
  const [phoneModalPlan, setPhoneModalPlan] = useState<PricingCardItem | null>(null);

  const handleConfirmSubscriptionPhone = async (phone: string) => {
    if (!phoneModalPlan) return;
    try {
      setLoadingPlanCode(phoneModalPlan.code);
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await membershipService.createCheckoutSession({
        planId: phoneModalPlan.id || phoneModalPlan.code,
        phone,
        successUrl: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&payment=success`,
        cancelUrl: `${origin}/#pricing`,
      });

      if (res?.url) {
        window.location.href = res.url;
      } else {
        router.push("/dashboard/billing");
      }
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message || err?.message || "Failed to initiate subscription checkout.";
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoadingPlanCode(null);
    }
  };

  const handleSelectPlan = async (item: PricingCardItem) => {
    if (item.isContactUs) {
      router.push("/contact");
      return;
    }

    if (item.isCurrent) {
      toast.info("You already have an active subscription to this plan.");
      router.push("/dashboard/billing");
      return;
    }

    if (isPaidActive) {
      toast.info(`You have an active plan. Redirecting to your billing dashboard to switch to the ${item.name} plan...`);
      router.push("/dashboard/billing#available-plans");
      return;
    }

    if (!isAuthenticated) {
      router.push(`/signup?plan=${encodeURIComponent(item.code)}`);
      return;
    }

    // Require and confirm contact number at subscription time
    setPhoneModalPlan(item);
  };

  return (
    <section id="pricing" className="py-24 px-6 bg-slate-50/50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-14">
        <PricingHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {plans.map((item) => {
            const isCurrent = Boolean(
              currentPlan &&
                (currentPlan.code === item.code ||
                  currentPlan.code?.replace("BRANDING_", "") === item.code.replace("BRANDING_", "") ||
                  currentPlan.name?.toLowerCase().trim() === item.name.toLowerCase().trim() ||
                  (item.id && currentPlan.id === item.id))
            );

            const cardItem: PricingCardItem = {
              ...item,
              isCurrent,
              hasActiveSub: isPaidActive,
            };

            return (
              <div key={item.code} className="flex">
                <PricingCard
                  item={cardItem}
                  loading={loadingPlanCode === item.code}
                  onSelect={handleSelectPlan}
                  onManageBilling={() => router.push("/dashboard/billing")}
                />
              </div>
            );
          })}
        </div>

        {/* Subscription Phone Collection Modal */}
        <SubscriptionPhoneModal
          isOpen={Boolean(phoneModalPlan)}
          onClose={() => setPhoneModalPlan(null)}
          plan={phoneModalPlan}
          onConfirm={handleConfirmSubscriptionPhone}
          loading={Boolean(loadingPlanCode)}
        />
      </div>
    </section>
  );
}
