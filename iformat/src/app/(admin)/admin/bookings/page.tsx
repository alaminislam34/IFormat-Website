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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/api-client";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch bookings overview
    setLoading(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Career Consultations & Bookings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Manage 1-on-1 career coaching appointments, advisor session slots, and booking statuses.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center mx-auto">
          <Calendar className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-white">Consultations Overview</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          Career guidance appointments booked through the iFormat Career Assistant. Advisor slots are auto-synced with user calendars.
        </p>

        <div className="pt-4 flex justify-center gap-3">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300">
            Consultation Fee: $49 / session
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs font-semibold text-emerald-400">
            Auto-Scheduling Active
          </span>
        </div>
      </div>
    </div>
  );
}
