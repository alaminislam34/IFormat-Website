"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { Bell, BellDot, CheckCheck, Loader2, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/queries/use-notifications";
import { NotificationDTO } from "@/types/api";

// ── helpers ────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "Just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function typeColor(type: string): string {
  const map: Record<string, string> = {
    APPLICATION_RECEIVED: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    APPLICATION_UPDATED: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    SHORTLISTED: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    REJECTED: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    SCREENED: "bg-violet-500/20 text-violet-300 border-violet-500/30",
    INTERVIEW_SCHEDULED: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    BOOKING_CONFIRMED: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    PAYMENT_SUCCESS: "bg-green-500/20 text-green-300 border-green-500/30",
    SYSTEM: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  };
  return map[type] ?? "bg-sky-500/20 text-sky-300 border-sky-500/30";
}

function typeLabel(type: string): string {
  return type
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── single notification row ─────────────────────────────────────────────────

interface NotifItemProps {
  notif: NotificationDTO;
  onMarkRead: (id: string) => void;
}

function NotifItem({ notif, onMarkRead }: NotifItemProps) {
  return (
    <div
      className={cn(
        "relative flex gap-3 px-4 py-3.5 transition-colors cursor-pointer group",
        "hover:bg-white/[0.04] border-b border-white/5 last:border-0",
        !notif.read && "bg-indigo-950/30"
      )}
      onClick={() => {
        if (!notif.read) onMarkRead(notif.id);
      }}
    >
      {/* Unread indicator dot */}
      {!notif.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
      )}

      <div className="flex-1 min-w-0 pl-1">
        {/* Type badge + time */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className={cn(
              "px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border",
              typeColor(notif.type)
            )}
          >
            {typeLabel(notif.type)}
          </span>
          <span className="text-[10px] text-slate-500 ml-auto shrink-0">
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        {/* Title */}
        <p
          className={cn(
            "text-[12px] font-semibold leading-snug truncate",
            notif.read ? "text-slate-400" : "text-white"
          )}
        >
          {notif.title}
        </p>

        {/* Message */}
        <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-2">
          {notif.message}
        </p>
      </div>
    </div>
  );
}

// ── main bell component ─────────────────────────────────────────────────────

interface NotificationBellProps {
  /** Color variant — mirrors the navbar variant prop */
  variant?: "dark" | "light";
}

export function NotificationBell({ variant = "light" }: NotificationBellProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const isDark = variant === "dark";

  const { data: notifications = [], isLoading } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();
  const { mutate: markAllRead, isPending: markingAll } = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const hasUnread = unreadCount > 0;

  // Close on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={`Notifications${hasUnread ? `, ${unreadCount} unread` : ""}`}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all cursor-pointer",
          isDark
            ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm"
        )}
      >
        {hasUnread ? (
          <BellDot className="w-4.5 h-4.5" />
        ) : (
          <Bell className="w-4.5 h-4.5" />
        )}

        {/* Unread badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-indigo-500 text-white text-[9px] font-black px-1 shadow-md shadow-indigo-500/50 ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute right-0 mt-2 z-50",
              "w-[360px] max-h-[480px] flex flex-col",
              "rounded-2xl border border-white/10 shadow-2xl shadow-black/40",
              "bg-slate-900/95 backdrop-blur-xl overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {hasUnread && (
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {hasUnread && (
                <button
                  onClick={() => markAllRead()}
                  disabled={markingAll}
                  className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {markingAll ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCheck className="w-3 h-3" />
                  )}
                  Mark all read
                </button>
              )}
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-500">
                  <div className="p-3 rounded-xl bg-slate-800/60">
                    <Package className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-slate-600">No notifications yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotifItem
                    key={n.id}
                    notif={n}
                    onMarkRead={(id) => markRead(id)}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-white/10 shrink-0">
                <p className="text-[10px] text-slate-600 text-center">
                  Showing {notifications.length} most recent notification
                  {notifications.length !== 1 ? "s" : ""} · Auto-refreshes every 30s
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
