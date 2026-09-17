"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/use-auth-store";
import { membershipService } from "@/services/membership.service";
import { PlanDTO, UserSubscriptionDetailsDTO } from "@/types/api";
import { toast } from "sonner";
import { ToastBanner } from "@/features/admin/components/shared/toast-banner";
import { BillingHeader } from "@/features/billing/components/billing-header";
import { ActivePlanCard } from "@/features/billing/components/active-plan-card";
import { QuotaMeters } from "@/features/billing/components/quota-meters";
import { PlanSwitcherGrid } from "@/features/billing/components/plan-switcher-grid";

import { CancelDialog } from "@/features/billing/components/cancel-dialog";
import { BillingSkeleton } from "@/features/billing/components/billing-skeleton";

export default function BillingDashboardPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const searchParams = useSearchParams();
  const hasNotifiedSuccess = useRef(false);

  const [subscription, setSubscription] = useState<UserSubscriptionDetailsDTO | null>(null);
  const [plans, setPlans] = useState<PlanDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const sessionIdParam = searchParams.get("session_id") || undefined;
  const paymentParam = searchParams.get("payment");

  const loadData = async (forceSessionId?: string) => {
    try {
      const activeSessionId = forceSessionId || sessionIdParam;
      const [subRes, plansRes] = await Promise.all([
        membershipService.getUserSubscription(activeSessionId),
        membershipService.getPlans(),
      ]);

      if (subRes) setSubscription(subRes);
      if (plansRes) setPlans(Array.isArray(plansRes) ? plansRes : (plansRes as any).plans || []);

      if ((paymentParam === "success" || activeSessionId) && !hasNotifiedSuccess.current) {
        hasNotifiedSuccess.current = true;
        toast.success("Membership successfully activated! Your account is now upgraded.");
        // Clean URL query parameters so refresh doesn't re-trigger the toast
        window.history.replaceState({}, "", "/dashboard/billing");
      }
    } catch (err: any) {
      console.warn("Could not fetch billing details:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [sessionIdParam, paymentParam]);

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
      toast.error(err.message || "Failed to open Stripe Billing Portal");
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setActionLoading("resume");
      await membershipService.resumeSubscription();
      toast.success("Your subscription has been renewed and will continue auto-renewing.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to resume subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmCancel = async () => {
    try {
      setActionLoading("cancel");
      await membershipService.cancelSubscription();
      setShowCancelModal(false);
      toast.success("Cancellation scheduled. You will keep premium access until your cycle ends.");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpgradePlan = async (planIdOrCode: string) => {
    try {
      setActionLoading(planIdOrCode);
      const matched = plans.find(
        (p) => p.id === planIdOrCode || p.code === planIdOrCode
      );
      const effectivePlanId = matched ? matched.id : planIdOrCode;

      const origin = window.location.origin;
      const session = await membershipService.createCheckoutSession({
        planId: effectivePlanId,
        successUrl: `${origin}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&payment=success`,
        cancelUrl: `${origin}/dashboard/billing?payment=cancelled`,
      });

      if (session?.url) window.location.href = session.url;
    } catch (err: any) {
      toast.error(err.message || "Failed to start Stripe checkout");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <BillingSkeleton />;
  }

  return (
    <div className="py-8 p-6 relative selection:bg-sky-100 selection:text-sky-900">
      <div className="space-y-10 relative z-10">
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
      </div>
    </div>
  );
}