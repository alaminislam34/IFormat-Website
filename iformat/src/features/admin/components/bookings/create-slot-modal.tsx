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
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
              disabled={isSubmitting}
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-5 h-9 rounded-xl shadow-lg shadow-sky-600/20 cursor-pointer"
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
