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
import { DEFAULT_BRANDING_PLANS, buildBrandingPlanCards } from "@/features/billing/utils/branding-plans";

export function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [commitmentInterval, setCommitmentInterval] = useState<"6_MONTHS" | "12_MONTHS">("6_MONTHS");
  const [plans, setPlans] = useState<PricingCardItem[]>(DEFAULT_BRANDING_PLANS);
  // Hide cards until admin-managed prices load, so old default prices never flash
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [loadingPlanCode, setLoadingPlanCode] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<UserSubscriptionDetailsDTO | null>(null);

  const fetchDynamicPlans = useCallback(async () => {
    try {
      const data = await membershipService.getPlans();
      const rawPlans = Array.isArray(data) ? data : (data as any)?.plans;
      setPlans(buildBrandingPlanCards(rawPlans));
    } catch {
      setPlans(DEFAULT_BRANDING_PLANS);
    } finally {
      setPlansLoaded(true);
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
        <PricingHeader
          commitmentInterval={commitmentInterval}
          setCommitmentInterval={setCommitmentInterval}
        />

        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch transition-opacity duration-300 ${
            plansLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {plans.map((item) => {
            const isCurrent = Boolean(
              currentPlan &&
                (currentPlan.code === item.code ||
                  currentPlan.code?.replace("BRANDING_", "") === item.code.replace("BRANDING_", "") ||
                  currentPlan.name?.toLowerCase().trim() === item.name.toLowerCase().trim() ||
                  (item.id && currentPlan.id === item.id))
            );

            // Compute badge based on 6 vs 12 months commitment
            let displayPrice = item.price;
            const commitmentBadge =
              commitmentInterval === "12_MONTHS"
                ? "12 Months Commitment"
                : "6 Months Commitment";

            if (item.price && !item.isContactUs) {
              // Same monthly price for 6 and 12 months commitment (members can cancel anytime)
              const baseNum = parseFloat(item.price.replace(/[^0-9.]/g, ""));
              if (!isNaN(baseNum) && baseNum > 0) {
                displayPrice = `$${baseNum}`;
              }
            }

            const cardItem: PricingCardItem = {
              ...item,
              price: displayPrice,
              commitmentBadge,
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
