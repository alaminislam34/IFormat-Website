"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/booking.service";
import { BookingDTO } from "@/types/api";
import { toast } from "sonner";

import { AdminBookingsKpiGrid } from "@/features/admin/components/bookings/admin-bookings-kpi-grid";
import { AdminBookingsTable } from "@/features/admin/components/bookings/admin-bookings-table";
import { CreateSlotModal } from "@/features/admin/components/bookings/create-slot-modal";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Create Slot Modal State
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [slotTitle, setSlotTitle] = useState("1-on-1 Career & CV Strategy Session");
  const [startDateTime, setStartDateTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priceInDollars, setPriceInDollars] = useState(49);
  const [isSubmittingSlot, setIsSubmittingSlot] = useState(false);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await bookingService.listMyBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDateTime) {
      toast.error("Please select a valid start date and time.");
      return;
    }

    const startDate = new Date(startDateTime);
    if (isNaN(startDate.getTime())) {
      toast.error("Invalid start time.");
      return;
    }

    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);

    try {
      setIsSubmittingSlot(true);
      await bookingService.createSlot({
        title: slotTitle.trim(),
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        priceInCents: Math.round(priceInDollars * 100),
      });

      toast.success("Consultation availability slot published successfully!");
      setIsSlotModalOpen(false);
      setStartDateTime("");
      await loadBookings();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create consultation slot.");
    } finally {
      setIsSubmittingSlot(false);
    }
  };

  const handleUpdateStatus = async (
    bookingId: string,
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING"
  ) => {
    try {
      await bookingService.updateStatus(bookingId, status);
      toast.success(`Booking status updated to ${status}.`);
      await loadBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to update booking status.");
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.serviceTitle?.toLowerCase().includes(searchLower) ||
      b.slot?.title?.toLowerCase().includes(searchLower) ||
      b.user?.name?.toLowerCase().includes(searchLower) ||
      b.user?.email?.toLowerCase().includes(searchLower) ||
      b.clientPhone?.toLowerCase().includes(searchLower) ||
      b.requirements?.toLowerCase().includes(searchLower) ||
      b.notes?.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const confirmedCount = bookings.filter((b) => b.status === "CONFIRMED").length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const cancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Orders & Client Fulfillment
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track client service package purchases, review project briefs, and manage delivery status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsSlotModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl h-9 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Slot
          </Button>
          <Button
            variant="outline"
            onClick={loadBookings}
            disabled={loading}
            className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs h-9 rounded-xl shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <AdminBookingsKpiGrid
        totalCount={bookings.length}
        confirmedCount={confirmedCount}
        completedCount={completedCount}
        cancelledCount={cancelledCount}
      />

      {/* Filters, Search & Bookings Table */}
      <AdminBookingsTable
        bookings={filteredBookings}
        loading={loading}
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Create Consultation Slot Modal */}
      <CreateSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        slotTitle={slotTitle}
        setSlotTitle={setSlotTitle}
        startDateTime={startDateTime}
        setStartDateTime={setStartDateTime}
        durationMinutes={durationMinutes}
        setDurationMinutes={setDurationMinutes}
        priceInDollars={priceInDollars}
        setPriceInDollars={setPriceInDollars}
        isSubmitting={isSubmittingSlot}
        onSubmit={handleCreateSlot}
      />
    </div>
  );
}
