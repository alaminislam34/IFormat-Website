"use client";

import React from "react";
import { Search, Loader2, Calendar, Video, Clock } from "lucide-react";
import { BookingDTO } from "@/types/api";

interface AdminBookingsTableProps {
  bookings: BookingDTO[];
  loading: boolean;
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (st: string) => void;
}

export function AdminBookingsTable({
  bookings,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
}: AdminBookingsTableProps) {
  return (
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
      ) : bookings.length === 0 ? (
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
              {bookings.map((b) => {
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
  );
}
