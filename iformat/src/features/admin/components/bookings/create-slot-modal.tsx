"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slotTitle: string;
  setSlotTitle: (s: string) => void;
  startDateTime: string;
  setStartDateTime: (s: string) => void;
  durationMinutes: number;
  setDurationMinutes: (n: number) => void;
  priceInDollars: number;
  setPriceInDollars: (n: number) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function CreateSlotModal({
  isOpen,
  onClose,
  slotTitle,
  setSlotTitle,
  startDateTime,
  setStartDateTime,
  durationMinutes,
  setDurationMinutes,
  priceInDollars,
  setPriceInDollars,
  isSubmitting,
  onSubmit,
}: CreateSlotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in-0 duration-150">
      <div className="relative bg-white border border-slate-200 rounded-3xl w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header: Fixed at top */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Create Consultation Slot</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish an open availability slot on the consultation calendar.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 scrollbar-thin">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Session Topic / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slotTitle}
                onChange={(e) => setSlotTitle(e.target.value)}
                placeholder="e.g. 1-on-1 Executive Career & CV Strategy"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Duration
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                  <option value={90}>90 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Price ($ USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={priceInDollars}
                  onChange={(e) => setPriceInDollars(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Fixed Footer: Always visible, never scrolls away */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 backdrop-blur-xs flex items-center justify-end gap-3 shrink-0 z-10">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 cursor-pointer h-9 px-4 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0A54B1] hover:bg-[#08448f] text-white text-xs font-semibold px-5 h-9 rounded-xl shadow-xs cursor-pointer"
            >
              {isSubmitting ? (
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
  );
}
