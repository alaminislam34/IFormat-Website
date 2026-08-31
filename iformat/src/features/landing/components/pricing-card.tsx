"use client";

import React from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PricingCardItem {
  id?: string;
  code: string;
  name: string;
  subtitle: string;
  price: string;
  priceSuffix?: string;
  isPopular?: boolean;
  features: string[];
  buttonText: string;
  isContactUs?: boolean;
}

interface PricingCardProps {
  item: PricingCardItem;
  loading?: boolean;
  onSelect: (item: PricingCardItem) => void;
}

export function PricingCard({ item, loading = false, onSelect }: PricingCardProps) {
  const isPopular = item.isPopular;

  return (
    <div
      className={`w-full rounded-[28px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 relative bg-white ${
        isPopular
          ? "border-2 border-[#00D2EE] shadow-xl shadow-sky-500/10 ring-1 ring-[#00D2EE]/30"
          : "border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00D2EE] text-slate-900 text-xs font-black tracking-wide shadow-sm">
          Most Popular
        </div>
      )}

      <div>
        {/* Title */}
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{item.name}</h3>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 mt-2 min-h-10 leading-relaxed">
          {item.subtitle}
        </p>

        {/* Price Tag */}
        <div className="my-6 min-h-14 flex items-baseline">
          {item.price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl sm:text-[42px] font-black text-slate-900 tracking-tight">
                {item.price}
              </span>
              {item.priceSuffix && (
                <span className="text-xs font-semibold text-slate-500">
                  {item.priceSuffix}
                </span>
              )}
            </div>
          ) : (
            <div className="h-10 flex items-center">
              <span className="text-sm font-semibold text-slate-400 italic">Custom Quote</span>
            </div>
          )}
        </div>

        {/* Feature List */}
        <div className="pt-2">
          <ul className="space-y-3.5">
            {item.features.map((feature, fIdx) => (
              <li key={`feat-${fIdx}`} className="flex items-start gap-3 text-xs leading-snug">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#00A8FF]" strokeWidth={2.5} />
                <span className="text-slate-700 font-medium">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Button */}
      <div className="pt-8 mt-auto">
        <Button
          onClick={() => onSelect(item)}
          disabled={loading}
          className={`w-full h-12 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            isPopular
              ? "bg-linear-to-r from-[#00D2EE] to-[#1E6FEB] hover:from-[#00c0db] hover:to-[#175ecf] text-white shadow-md shadow-sky-400/20 border-0"
              : item.isContactUs
              ? "bg-[#0B1528] hover:bg-[#16233B] text-white"
              : "bg-[#0B1528] hover:bg-[#16233B] text-white"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : (
            item.buttonText || "Get Started"
          )}
        </Button>
      </div>
    </div>
  );
}
