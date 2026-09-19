"use client";

import React, { useState } from "react";
import {
  Loader2,
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
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Skeleton,
} from "@/components/ui/table";

interface AdminBookingsTableProps {
  bookings: BookingDTO[];
  loading: boolean;
  onUpdateStatus?: (bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "PENDING") => Promise<void>;
}

export function AdminBookingsTable({
  bookings,
  loading,
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
    <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service Package / Brief</TableHead>
            <TableHead>Client Contact</TableHead>
            <TableHead>Ordered At</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Fulfillment Status</TableHead>
            {onUpdateStatus && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            /* UI-Preserving Skeleton Loading Rows */
            Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={`booking-skeleton-${idx}`} className="hover:bg-transparent">
                {/* Service Package / Brief */}
                <TableCell className="max-w-xs">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded-sm shrink-0" />
                      <Skeleton className="h-4 w-44" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3.5 w-20 rounded-md" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </TableCell>

                {/* Client Contact */}
                <TableCell>
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </TableCell>

                {/* Ordered At */}
                <TableCell>
                  <Skeleton className="h-3.5 w-24" />
                </TableCell>

                {/* Payment */}
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12 rounded-md" />
                  </div>
                </TableCell>

                {/* Fulfillment Status */}
                <TableCell>
                  <Skeleton className="h-6 w-24 rounded-full" />
                </TableCell>

                {/* Actions */}
                {onUpdateStatus && (
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Skeleton className="h-8 w-24 rounded-xl" />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : bookings.length === 0 ? (
            /* Empty State */
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={onUpdateStatus ? 6 : 5} className="p-0 border-none">
                <div className="py-16 px-6 text-center space-y-3 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/60 text-slate-400 flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">No Orders Found</h4>
                    <p className="text-xs text-slate-500 max-w-sm">
                      No service orders match your criteria. Try adjusting your search or filters.
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((b) => {
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
                <TableRow key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Service title and brief toggle */}
                  <TableCell className="max-w-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-2">
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
                          className="text-[11px] text-blue-600 hover:text-blue-500 underline underline-offset-2 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <FileText className="w-3 h-3" /> View Brief & Notes
                        </button>
                      )}
                    </div>
                  </TableCell>

                  {/* Client Contact Info */}
                  <TableCell>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.user?.name || "Client"}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{b.user?.email || "—"}</span>
                    </div>
                    {(b.clientPhone || b.user?.phone) && (
                      <div className="text-[11px] text-blue-600 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{b.clientPhone || b.user?.phone}</span>
                      </div>
                    )}
                  </TableCell>

                  {/* Order Date */}
                  <TableCell className="text-slate-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{orderDate}</span>
                    </div>
                  </TableCell>

                  {/* Payment Status & Fee */}
                  <TableCell className="whitespace-nowrap">
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
                  </TableCell>

                  {/* Fulfillment Status */}
                  <TableCell className="whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
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
                  </TableCell>

                  {/* Actions */}
                  {onUpdateStatus && (
                    <TableCell className="text-right whitespace-nowrap">
                      {isUpdating ? (
                        <span className="inline-flex items-center text-slate-500 text-[11px]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin mr-1 text-blue-600" /> Updating...
                        </span>
                      ) : b.status === "PENDING" ? (
                        <div className="inline-flex items-center justify-end gap-1.5">
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
                        <div className="inline-flex items-center justify-end gap-1.5">
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
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
          </TableBody>
        </Table>

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
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 items-center gap-1.5">
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
