"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { useMyBookings, useAvailableSlots } from "@/hooks";
import { BookConsultationModal } from "@/features/services/components/book-consultation-modal";

import { CandidateBookingsHeader } from "@/features/bookings/components/candidate-bookings-header";
import { CandidateBookingsList } from "@/features/bookings/components/candidate-bookings-list";
import { CandidateBookingsSidebar } from "@/features/bookings/components/candidate-bookings-sidebar";

export default function CandidateBookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const {
    data: bookings = [],
    isLoading: loadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useMyBookings();

  const {
    data: availableSlots = [],
    isLoading: loadingSlots,
    refetch: refetchSlots,
  } = useAvailableSlots();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/dashboard/bookings");
    }
  }, [isAuthenticated, router]);

  const handleRefresh = async () => {
    await Promise.all([refetchBookings(), refetchSlots()]);
    toast.success("Consultations updated.");
  };

  return (
    <div className="text-slate-900 py-8">
      <div className="w-11/12 mx-auto space-y-8">
        <CandidateBookingsHeader
          onBookClick={() => setIsBookModalOpen(true)}
          onRefresh={handleRefresh}
        />

        {/* Bookings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Scheduled Sessions (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            <CandidateBookingsList
              bookings={bookings}
              isLoading={loadingBookings}
              error={bookingsError}
              onBookClick={() => setIsBookModalOpen(true)}
              onRetry={() => refetchBookings()}
            />
          </div>

          {/* Available Open Slots & Checklist (1 col) */}
          <div className="space-y-6">
            <CandidateBookingsSidebar
              availableSlots={availableSlots}
              loadingSlots={loadingSlots}
              onBookSlot={() => setIsBookModalOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Book Consultation Modal */}
      {isBookModalOpen && (
        <BookConsultationModal
          isOpen={isBookModalOpen}
          onClose={() => {
            setIsBookModalOpen(false);
            refetchBookings();
            refetchSlots();
          }}
        />
      )}
    </div>
  );
}
