"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/use-auth-store";
import { membershipService } from "@/services/membership.service";
import { PlanDTO, UserSubscriptionDetailsDTO } from "@/types/api";
import { ToastBanner } from "@/features/admin/components/shared/toast-banner";
import { BillingHeader } from "@/features/billing/components/billing-header";
import { ActivePlanCard } from "@/features/billing/components/active-plan-card";
import { QuotaMeters } from "@/features/billing/components/quota-meters";
import { PlanSwitcherGrid } from "@/features/billing/components/plan-switcher-grid";
import { CancelDialog } from "@/features/billing/components/cancel-dialog";
import { Footer } from "@/components/layout/footer";

export default function BillingDashboardPage() {
  const { user } = useAuthStore();
  const [subscription, setSubscription] = useState<UserSubscriptionDetailsDTO | null>(null);
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadData = async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        membershipService.getUserSubscription(),
        membershipService.getPlans(),
      ]);

      if (subRes) setSubscription(subRes);
      if (plansRes) setPlans(Array.isArray(plansRes) ? plansRes : (plansRes as any).plans || []);
    } catch (err: any) {
      console.warn("Could not fetch billing details:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenPortal = async () => {
    try {
      setActionLoading("portal");
      const portal = await membershipService.createCustomerPortal();
      if (portal?.url) window.location.href = portal.url;
    } catch (err: any) {
      alert(err.message || "Failed to open Stripe Billing Portal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading("resume");
      await membershipService.resumeSubscription();
      setToastMessage("Your subscription has been renewed and will continue auto-renewing.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setActionLoading("cancel");
      await membershipService.cancelSubscription();
      setShowCancelModal(false);
      setToastMessage("Cancellation scheduled. You will keep premium access until your cycle ends.");
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    try {
      setActionLoading(planId);
      const origin = window.location.origin;
      const session = await membershipService.createCheckoutSession({
        planId,
        successUrl: `${origin}/dashboard/billing?payment=success`,
        cancelUrl: `${origin}/dashboard/billing?payment=cancelled`,
      });

      if (session?.url) window.location.href = session.url;
    } catch (err: any) {
      alert(err.message || "Failed to start Stripe checkout");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between pt-16">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Loader2 className="w-9 h-9 text-[#0ea5e9] animate-spin mx-auto" />
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
              Loading Billing & Entitlements...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between relative selection:bg-sky-100 selection:text-sky-900">
      <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-sky-50/70 via-slate-50/50 to-transparent pointer-events-none" />

      <div>
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 space-y-10 relative z-10">
          <ToastBanner message={toastMessage} onClose={() => setToastMessage(null)} />

          <BillingHeader onRefresh={handleRefresh} refreshing={refreshing} />

          <ActivePlanCard
            subscription={subscription}
            actionLoading={actionLoading}
            onOpenPortal={handleOpenPortal}
            onResumeSubscription={handleResumeSubscription}
            onOpenCancelModal={() => setShowCancelModal(true)}
          />

          <QuotaMeters subscription={subscription} />

          <PlanSwitcherGrid
            plans={plans}
            subscription={subscription}
            userRole={user?.role}
            actionLoading={actionLoading}
            onUpgradePlan={handleUpgradePlan}
          />

          <CancelDialog
            isOpen={showCancelModal}
            onClose={() => setShowCancelModal(false)}
            onConfirm={handleConfirmCancel}
            loading={actionLoading === "cancel"}
          />
        </main>
      </div>

      <Footer />
    </div>
  );
}
