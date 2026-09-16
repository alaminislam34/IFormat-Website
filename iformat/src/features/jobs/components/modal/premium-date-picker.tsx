"use client";

import React, { useState, useRef, useEffect } from "react";
import { UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles, Check, Clock } from "lucide-react";
import { CreateJobFormData } from "@/lib/validations/job.schema";
import { cn } from "@/lib/utils";

interface PremiumDatePickerProps {
  setValue: UseFormSetValue<CreateJobFormData>;
  watch?: UseFormWatch<CreateJobFormData>;
  errors: FieldErrors<CreateJobFormData>;
  initialDate?: string;
}

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function PremiumDatePicker({
  setValue,
  watch,
  errors,
  initialDate,
}: PremiumDatePickerProps) {
  const selectedDateStr = watch ? watch("validity") : initialDate;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse currently selected date
  const parsedSelected = selectedDateStr ? new Date(selectedDateStr) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const validSelectedDate = isNaN(parsedSelected.getTime())
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : parsedSelected;

  // View year and month for the calendar navigator
  const [viewYear, setViewYear] = useState(validSelectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(validSelectedDate.getMonth());

  // Sync navigator when selectedDateStr updates from form reset
  useEffect(() => {
    if (selectedDateStr) {
      const d = new Date(selectedDateStr);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [selectedDateStr]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Today helper
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format date helper: YYYY-MM-DD
  const toDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSelectDate = (date: Date) => {
    const str = toDateString(date);
    setValue("validity", str, { shouldValidate: true, shouldDirty: true });
    setIsOpen(false);
  };

  const handleQuickPreset = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    handleSelectDate(target);
    setViewYear(target.getFullYear());
    setViewMonth(target.getMonth());
  };

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Days remaining calculation
  const diffDays = Math.ceil(
    (validSelectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Job Validity <span className="text-rose-500">*</span>
        </label>
        {diffDays > 0 && (
          <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Expires in {diffDays} {diffDays === 1 ? "day" : "days"}
          </span>
        )}
      </div>

      {/* Trigger Button Displaying Custom Date */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-11 px-4 rounded-xl border bg-white text-sm text-left flex items-center justify-between transition-all cursor-pointer select-none",
          errors.validity
            ? "border-rose-300 ring-2 ring-rose-100"
            : isOpen
            ? "border-sky-500 ring-2 ring-sky-100 shadow-xs"
            : "border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-semibold text-slate-800 text-sm">
            {validSelectedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            ({toDateString(validSelectedDate)})
          </span>
        </div>

        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
          <CalendarIcon className="w-4 h-4" />
        </div>
      </button>

      {/* Premium Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-84 bg-white rounded-2xl border border-slate-100 shadow-2xl p-4 animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Quick Presets */}
          <div className="mb-3.5 pb-3 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Validity Duration
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { label: "15 Days", days: 15 },
                { label: "30 Days", days: 30 },
                { label: "60 Days", days: 60 },
                { label: "90 Days", days: 90 },
              ].map((preset) => (
                <button
                  key={preset.days}
                  type="button"
                  onClick={() => handleQuickPreset(preset.days)}
                  className={cn(
                    "py-1.5 text-center text-xs font-bold rounded-lg border transition-all cursor-pointer",
                    diffDays === preset.days
                      ? "bg-sky-500 text-white border-sky-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100 hover:text-slate-800"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Month / Year Header Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="text-xs font-bold text-slate-800 tracking-tight">
              {MONTHS[viewMonth]} {viewYear}
            </h4>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells before 1st of month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="w-8 h-8" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const cellDate = new Date(viewYear, viewMonth, dayNum);
              cellDate.setHours(0, 0, 0, 0);

              const isPast = cellDate < today;
              const isSelected =
                cellDate.getFullYear() === validSelectedDate.getFullYear() &&
                cellDate.getMonth() === validSelectedDate.getMonth() &&
                cellDate.getDate() === validSelectedDate.getDate();

              const isToday =
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth() &&
                cellDate.getDate() === today.getDate();

              return (
                <button
                  key={dayNum}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDate(cellDate)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all relative cursor-pointer",
                    isSelected
                      ? "bg-brand-gradient text-white shadow-md shadow-blue-500/25"
                      : isPast
                      ? "text-slate-300 cursor-not-allowed opacity-40"
                      : isToday
                      ? "text-sky-600 font-extrabold bg-sky-50 hover:bg-sky-100"
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {dayNum}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-sky-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Listing closes at 11:59 PM</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
