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
  onUpdateStatus?: (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING") => Promise<void>;
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

  const handleAction = async (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING") => {
    if (!onUpdateStatus) return;
    try {
      setUpdatingId(bookingId);
      await onUpdateStatus(bookingId, status);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by package, name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-slate-50 text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {status === "ALL"
                ? "All Orders"
                : status === "PENDING"
                ? "Cancellation Requests"
                : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-500">Loading service orders & bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No Orders Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {search || statusFilter !== "ALL"
              ? "No orders match your search criteria. Try adjusting your filters."
              : "No service package orders recorded yet."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3">Service Package / Brief</th>
                <th className="pb-3">Client Contact</th>
                <th className="pb-3">Ordered At</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                {onUpdateStatus && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => {
                const isPackageOrder = !b.slotId;
                const title = b.serviceTitle || b.slot?.title || "Career Service Package";
                const orderDate = new Date(b.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
                const priceFormatted = b.priceInCents
                  ? `$${(b.priceInCents / 100).toFixed(2)}`
                  : b.slot?.priceInCents
                  ? `$${(b.slot.priceInCents / 100).toFixed(2)}`
                  : "$0.00";

                const isUpdating = updatingId === b.id;
                const hasBrief = Boolean(b.requirements || b.notes);

                return (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Service title and brief toggle */}
                    <td className="py-3.5 pr-4 max-w-xs">
                      <div className="font-medium text-slate-900 flex items-center gap-2">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {isPackageOrder ? "Service Package" : "Consultation Slot"}
                        </span>
                        {hasBrief && (
                          <button
                            type="button"
                            onClick={() => setSelectedBrief(b)}
                            className="text-[11px] text-blue-600 hover:text-blue-500 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3 h-3" /> View Client Brief & Notes
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Client Contact Info */}
                    <td className="py-3.5 pr-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{b.user?.name || "Client"}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        <span>{b.user?.email || "—"}</span>
                      </div>
                      {(b.clientPhone || b.user?.phone) && (
                        <div className="text-[11px] text-blue-600 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{b.clientPhone || b.user?.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Order Date */}
                    <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{orderDate}</span>
                      </div>
                    </td>

                    {/* Payment Status & Fee */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{priceFormatted}</div>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold mt-0.5 ${
                          b.paymentStatus === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <CreditCard className="w-2.5 h-2.5 mr-1" />
                        {b.paymentStatus || "Paid"}
                      </span>
                    </td>

                    {/* Fulfillment Status */}
                    <td className="py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : b.status === "PENDING"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : b.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {b.status === "CONFIRMED"
                          ? "Active / In Progress"
                          : b.status === "PENDING"
                          ? "⚠️ Cancellation Requested"
                          : b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    {onUpdateStatus && (
                      <td className="py-3.5 text-right whitespace-nowrap">
                        {isUpdating ? (
                          <span className="inline-flex items-center text-slate-500 text-[11px]">
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-blue-600" /> Updating...
                          </span>
                        ) : b.status === "PENDING" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAction(b.id, "CANCELLED")}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Approve Cancellation"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Approve Cancel
                            </button>
                            <button
                              onClick={() => handleAction(b.id, "CONFIRMED")}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Decline Cancellation (Keep Active)"
                            >
                              <XCircle className="w-3 h-3" /> Decline
                            </button>
                          </div>
                        ) : b.status === "CONFIRMED" ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleAction(b.id, "COMPLETED")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Mark as Completed"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Mark Completed
                            </button>
                            <button
                              onClick={() => handleAction(b.id, "CANCELLED")}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Cancel / Refund Order"
                            >
                              <XCircle className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        ) : b.status === "CANCELLED" ? (
                          <button
                            onClick={() => handleAction(b.id, "CONFIRMED")}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                            title="Reactivate Order"
                          >
                            <RotateCcw className="w-3 h-3" /> Reactivate
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Fulfilled</span>
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
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedBrief.serviceTitle || "Client Project Brief"}
                </h4>
                <p className="text-xs text-slate-500">
                  Client: {selectedBrief.user?.name} ({selectedBrief.user?.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Client Phone */}
            {selectedBrief.clientPhone && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2 text-xs text-slate-800">
                <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-slate-500">Direct Phone:</span>
                <span className="font-bold text-blue-700">{selectedBrief.clientPhone}</span>
              </div>
            )}

            {/* Requirements / Brief */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" /> Project Requirements & Target Roles
              </label>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {selectedBrief.requirements || "No specific requirements specified."}
              </div>
            </div>

            {/* Additional Notes */}
            {selectedBrief.notes && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Additional Notes</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
                  {selectedBrief.notes}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedBrief(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
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
