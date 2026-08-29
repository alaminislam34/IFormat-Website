"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  User,
  DollarSign,
  Loader2,
  AlertCircle,
  RefreshCw,
  Video,
  Plus,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingService } from "@/services/booking.service";
import { BookingDTO } from "@/types/api";
import { toast } from "sonner";

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

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      !search ||
      b.slot?.title?.toLowerCase().includes(searchLower) ||
      b.user?.name?.toLowerCase().includes(searchLower) ||
      b.user?.email?.toLowerCase().includes(searchLower) ||
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Consultations & Bookings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage 1-on-1 career coaching appointments, advisor session slots, and booking statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsSlotModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl h-9 shadow-lg shadow-sky-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Create Slot
          </Button>
          <Button
            variant="outline"
            onClick={loadBookings}
            disabled={loading}
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-300 text-xs h-9 rounded-xl cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs text-slate-400 font-medium">Total Bookings</div>
          <div className="text-2xl font-bold text-white mt-1">{bookings.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs text-emerald-400 font-medium">Confirmed</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{confirmedCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs text-blue-400 font-medium">Completed</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">{completedCount}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs text-rose-400 font-medium">Cancelled</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{cancelledCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            {["ALL", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/40"
                    : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
                }`}
              >
                {status === "ALL" ? "All Sessions" : status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
            <p className="text-xs text-slate-400">Loading consultation bookings...</p>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-white">No Consultations Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || statusFilter !== "ALL"
                ? "No sessions match your search criteria. Try adjusting your filters."
                : "No career consultation bookings recorded yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Session Topic</th>
                  <th className="pb-3 font-semibold">Date & Time</th>
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Fee</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBookings.map((b) => {
                  const startTime = b.slot?.startTime
                    ? new Date(b.slot.startTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Flexible";

                  const priceFormatted = b.slot?.priceInCents
                    ? `$${(b.slot.priceInCents / 100).toFixed(2)}`
                    : "Free";

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          <Video className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span>{b.slot?.title || "Career Consultation"}</span>
                        </div>
                        {b.notes && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {b.notes}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{startTime}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div className="font-medium text-slate-200">
                          {b.user?.name || "Candidate"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {b.user?.email || "—"}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-300 whitespace-nowrap font-medium">
                        {priceFormatted}
                      </td>
                      <td className="py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            b.status === "CONFIRMED"
                              ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                              : b.status === "COMPLETED"
                              ? "bg-blue-950/80 text-blue-400 border border-blue-800/80"
                              : "bg-rose-950/80 text-rose-400 border border-rose-800/80"
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Consultation Slot Modal */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in-0 duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-lg space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Create Consultation Slot</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish an open availability slot on the consultation calendar.
                </p>
              </div>
              <button
                onClick={() => setIsSlotModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Session Topic / Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slotTitle}
                  onChange={(e) => setSlotTitle(e.target.value)}
                  placeholder="e.g. 1-on-1 Executive Career & CV Strategy"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Start Date & Time <span className="text-rose-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                    <option value={90}>90 Minutes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Price ($ USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={priceInDollars}
                    onChange={(e) => setPriceInDollars(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmittingSlot}
                  onClick={() => setIsSlotModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingSlot}
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 h-9 rounded-xl shadow-lg shadow-sky-600/20 cursor-pointer"
                >
                  {isSubmittingSlot ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Publishing...
                    </>
                  ) : (
                    "Publish Slot"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
