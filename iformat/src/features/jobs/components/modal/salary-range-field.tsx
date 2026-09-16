"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { UseFormSetValue, FieldErrors, UseFormWatch } from "react-hook-form";
import { AlertCircle, DollarSign, Check, Sparkles } from "lucide-react";
import { CreateJobFormData } from "@/lib/validations/job.schema";
import { cn } from "@/lib/utils";
import {
  CURRENCIES,
  PERIODS,
  DEFAULT_CURRENCY,
  DEFAULT_PERIOD,
} from "@/features/jobs/constants";

interface SalaryRangeFieldProps {
  setValue: UseFormSetValue<CreateJobFormData>;
  watch?: UseFormWatch<CreateJobFormData>;
  errors: FieldErrors<CreateJobFormData>;
  initialValue?: string;
}

export function SalaryRangeField({
  setValue,
  watch,
  errors,
  initialValue,
}: SalaryRangeFieldProps) {
  const currentSalary = watch ? watch("salary") : initialValue;

  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [period, setPeriod] = useState(DEFAULT_PERIOD);
  const [isNegotiable, setIsNegotiable] = useState(false);
  const lastEmittedValue = useRef<string | null>(null);

  // Parse incoming salary string whenever it changes externally (e.g. from database reset)
  useEffect(() => {
    if (!currentSalary) {
      if (lastEmittedValue.current !== "") {
        setMinSalary("");
        setMaxSalary("");
        setIsNegotiable(false);
        lastEmittedValue.current = "";
      }
      return;
    }

    // Ignore if this change came from our own user typing
    if (currentSalary === lastEmittedValue.current) return;

    lastEmittedValue.current = currentSalary;
    const trimmed = currentSalary.trim();

    if (/^(competitive|negotiable|undisclosed)/i.test(trimmed)) {
      setIsNegotiable(true);
      setMinSalary("");
      setMaxSalary("");
      return;
    }

    setIsNegotiable(false);

    // Parse currency
    const foundCurrency = CURRENCIES.find((c) => trimmed.startsWith(c.symbol));
    if (foundCurrency) {
      setCurrency(foundCurrency.symbol);
    }

    // Parse period
    if (trimmed.toLowerCase().includes("/ mo") || trimmed.toLowerCase().includes("/month")) {
      setPeriod("/ mo");
    } else if (trimmed.toLowerCase().includes("/ hr") || trimmed.toLowerCase().includes("/hour")) {
      setPeriod("/ hr");
    } else {
      setPeriod("/ yr");
    }

    // Parse numbers
    const cleaned = trimmed.replace(/[^\d\s-]/g, "");
    const parts = cleaned.split("-").map((p) => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      const num1 = parseInt(parts[0].replace(/,/g, ""), 10);
      const num2 = parseInt(parts[1].replace(/,/g, ""), 10);
      setMinSalary(!isNaN(num1) ? num1.toLocaleString() : "");
      setMaxSalary(!isNaN(num2) ? num2.toLocaleString() : "");
    } else if (parts.length === 1) {
      const num = parseInt(parts[0].replace(/,/g, ""), 10);
      setMinSalary(!isNaN(num) ? num.toLocaleString() : "");
      setMaxSalary("");
    } else {
      setMinSalary("");
      setMaxSalary("");
    }
  }, [currentSalary]);

  // Format and update parent form state whenever user changes values
  useEffect(() => {
    if (isNegotiable) {
      const val = "Competitive / Negotiable";
      lastEmittedValue.current = val;
      setValue("salary", val, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    const minClean = minSalary.replace(/[^\d]/g, "");
    const maxClean = maxSalary.replace(/[^\d]/g, "");

    let formatted = "";
    if (minClean && maxClean) {
      const minNum = parseInt(minClean, 10).toLocaleString();
      const maxNum = parseInt(maxClean, 10).toLocaleString();
      formatted = `${currency}${minNum} - ${currency}${maxNum} ${period}`;
    } else if (minClean) {
      const minNum = parseInt(minClean, 10).toLocaleString();
      formatted = `From ${currency}${minNum} ${period}`;
    } else if (maxClean) {
      const maxNum = parseInt(maxClean, 10).toLocaleString();
      formatted = `Up to ${currency}${maxNum} ${period}`;
    } else {
      formatted = "";
    }

    lastEmittedValue.current = formatted;
    setValue("salary", formatted, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [currency, minSalary, maxSalary, period, isNegotiable, setValue]);

  // Handle number input with comma formatting and digit-only sanitization
  const handleNumberChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const digitsOnly = value.replace(/[^\d]/g, "");
    if (!digitsOnly) {
      setter("");
      return;
    }
    const num = parseInt(digitsOnly, 10);
    setter(num.toLocaleString());
  };

  const minNum = parseInt(minSalary.replace(/[^\d]/g, ""), 10) || 0;
  const maxNum = parseInt(maxSalary.replace(/[^\d]/g, ""), 10) || 0;
  const hasRangeError = !isNegotiable && minNum > 0 && maxNum > 0 && minNum > maxNum;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Salary Range <span className="text-rose-500">*</span>
        </label>

        {/* Quick Negotiable Toggle Button */}
        <button
          type="button"
          onClick={() => setIsNegotiable(!isNegotiable)}
          className={cn(
            "text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5",
            isNegotiable
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-xs"
              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
          )}
        >
          {isNegotiable && <Check className="w-3 h-3 text-emerald-600" />}
          <span>{isNegotiable ? "Negotiable Selected" : "Set as Negotiable"}</span>
        </button>
      </div>

      {isNegotiable ? (
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Salary will be displayed as <strong>Competitive / Negotiable</strong></span>
          </div>
          <button
            type="button"
            onClick={() => setIsNegotiable(false)}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
          >
            Enter specific numbers
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Structured Input Row */}
          <div
            className={cn(
              "grid grid-cols-12 gap-2 p-1.5 bg-slate-50/80 border rounded-2xl transition-all",
              errors.salary || hasRangeError
                ? "border-rose-300 ring-2 ring-rose-100 bg-rose-50/20"
                : "border-slate-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 bg-white"
            )}
          >
            {/* Currency Selector */}
            <div className="col-span-3 sm:col-span-3">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full h-10 px-2.5 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.symbol}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Salary */}
            <div className="col-span-4 sm:col-span-3">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Min (e.g. 80,000)"
                  value={minSalary}
                  onChange={(e) => handleNumberChange(e.target.value, setMinSalary)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Range Divider */}
            <div className="hidden sm:flex col-span-1 items-center justify-center text-slate-400 text-xs font-bold">
              to
            </div>

            {/* Max Salary */}
            <div className="col-span-5 sm:col-span-3">
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Max (e.g. 120,000)"
                  value={maxSalary}
                  onChange={(e) => handleNumberChange(e.target.value, setMaxSalary)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Period Selector */}
            <div className="col-span-12 sm:col-span-2">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full h-10 px-2 rounded-xl border border-slate-200/80 bg-slate-50 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-400 cursor-pointer"
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Formatted Preview Badge */}
          {(minSalary || maxSalary) && !hasRangeError && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-[11px] text-slate-400 font-medium">Card Preview:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                {minSalary && maxSalary
                  ? `${currency}${minSalary} - ${currency}${maxSalary} ${period}`
                  : minSalary
                  ? `From ${currency}${minSalary} ${period}`
                  : `Up to ${currency}${maxSalary} ${period}`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {hasRangeError && (
        <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          Minimum salary cannot be greater than maximum salary
        </p>
      )}

      {errors.salary && !hasRangeError && (
        <p className="text-xs text-rose-500 font-semibold flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {errors.salary.message}
        </p>
      )}
    </div>
  );
}
