"use client";

import React, { useState } from "react";
import {
  Search,
  Loader2,
  Calendar,
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
  Phone,
  Mail,
  User,
  X,
  CreditCard,
} from "lucide-react";
import { BookingDTO } from "@/types/api";

interface AdminBookingsTableProps {
  bookings: BookingDTO[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
  onUpdateStatus?: (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => Promise<void>;
}

export function AdminBookingsTable({
  bookings,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  onUpdateStatus,
}: AdminBookingsTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedBrief, setSelectedBrief] = useState<BookingDTO | null>(null);

  const handleAction = async (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED") => {
    if (!onUpdateStatus) return;
    try {
      setUpdatingId(bookingId);
      await onUpdateStatus(bookingId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by package, name, phone, email..."
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
              {status === "ALL" ? "All Orders" : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading service orders & bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No Orders Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "No orders match your search criteria. Try adjusting your filters."
              : "No service package orders recorded yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Service Package / Brief</th>
                <th className="pb-3 font-semibold">Client Contact</th>
                <th className="pb-3 font-semibold">Date Placed</th>
                <th className="pb-3 font-semibold">Payment / Fee</th>
                <th className="pb-3 font-semibold">Fulfillment</th>
                {onUpdateStatus && <th className="pb-3 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings.map((b) => {
                const title = b.serviceTitle || b.slot?.title || "Career Service Package";
                const isPackageOrder = !b.slotId;
                const orderDate = new Date(b.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                const priceNum = b.priceInCents ?? b.slot?.priceInCents;
                const priceFormatted = priceNum
                  ? `$${(priceNum / 100).toFixed(2)}`
                  : "$0.00";

                const isUpdating = updatingId === b.id;
                const hasBrief = Boolean(b.requirements || b.notes);

                return (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Service title and brief toggle */}
                    <td className="py-3.5 pr-4 max-w-xs">
                      <div className="font-medium text-white flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-800/50">
                          {isPackageOrder ? "Service Package" : "Consultation Slot"}
                        </span>
                        {hasBrief && (
                          <button
                            type="button"
                            onClick={() => setSelectedBrief(b)}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" /> View Client Brief
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Client Contact Info */}
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-slate-200 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{b.user?.name || "Client"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{b.user?.email || "—"}</span>
                      </div>
                      {(b.clientPhone || b.user?.phone) && (
                        <div className="text-[11px] text-cyan-400 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <span>{b.clientPhone || b.user?.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Order Date */}
                    <td className="py-3.5 pr-4 text-slate-300 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{orderDate}</span>
                      </div>
                    </td>

                    {/* Payment Status & Fee */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <div className="font-bold text-white">{priceFormatted}</div>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mt-0.5 ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/80"
                            : "bg-amber-950/80 text-amber-400 border border-amber-800/80"
                        }`}
                      >
                        <CreditCard className="w-2.5 h-2.5 mr-1" />
                        {b.paymentStatus || "PAID"}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
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
                        {b.status === "CONFIRMED" ? "Active / In Progress" : b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    {onUpdateStatus && (
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {isUpdating ? (
                          <span className="inline-flex items-center text-slate-400 text-[11px]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-sky-400" /> Updating...
                          </span>
                        ) : b.status === "CONFIRMED" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAction(b.id, "COMPLETED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark Completed
                            </button>
                            <button
                              onClick={() => handleAction(b.id, "CANCELLED")}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Cancel / Refund Order"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        ) : b.status === "CANCELLED" ? (
                          <button
                            onClick={() => handleAction(b.id, "CONFIRMED")}
                            className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Reactivate Order"
                          >
                            <RotateCcw className="w-3 h-3" /> Reactivate
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Fulfilled</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Client Brief & Requirements Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-base font-bold text-white">
                  {selectedBrief.serviceTitle || "Client Project Brief"}
                </h4>
                <p className="text-xs text-slate-400">
                  Client: {selectedBrief.user?.name} ({selectedBrief.user?.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Phone */}
            {selectedBrief.clientPhone && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-xs text-white">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-slate-400">Direct Phone:</span>
                <span className="font-bold text-cyan-300">{selectedBrief.clientPhone}</span>
              </div>
            )}

            {/* Requirements / Brief */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" /> Project Requirements & Target Roles
              </label>
              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {selectedBrief.requirements || "No specific requirements specified."}
              </div>
            </div>

            {/* Additional Notes */}
            {selectedBrief.notes && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Additional Notes</label>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
                  {selectedBrief.notes}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Close Brief
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
