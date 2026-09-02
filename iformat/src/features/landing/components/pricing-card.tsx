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
      className={`w-full rounded-[24px] p-8 flex flex-col justify-between transition-all duration-300 relative bg-white ${
        isPopular
          ? "border-2 border-[#00D2EE] shadow-[0_0_30px_rgba(0,210,238,0.22)] ring-1 ring-[#00D2EE]/40"
          : "border border-slate-100 shadow-sm hover:shadow-md"
      }`}
    >
      {/* Most Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00D2EE] text-white text-xs font-bold tracking-wide shadow-xs whitespace-nowrap">
          Most Popular
        </div>
      )}

      <div>
        {/* Title */}
        <h3 className="text-2xl font-bold text-[#0B1528] tracking-tight">{item.name}</h3>

        {/* Subtitle */}
        <p className="text-xs text-[#64748B] mt-2 mb-6 min-h-[38px] leading-relaxed">
          {item.subtitle}
        </p>

        {/* Price Tag */}
        <div className="mb-6 min-h-[44px] flex items-baseline">
          {item.price ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0B1528] tracking-tight">
                {item.price}
              </span>
              {item.priceSuffix && (
                <span className="text-xs font-semibold text-[#64748B]">
                  {item.priceSuffix}
                </span>
              )}
            </div>
          ) : (
            <div className="h-10" />
          )}
        </div>

        {/* Feature List */}
        <div>
          <ul className="space-y-3.5">
            {item.features.map((feature, fIdx) => (
              <li key={`feat-${fIdx}`} className="flex items-start gap-2.5 text-xs leading-snug">
                <Check className="w-4 h-4 shrink-0 mt-0.5 text-[#0099FF] stroke-[2.5]" />
                <span className="text-[#334155] font-medium leading-relaxed">{feature}</span>
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
          className={`w-full h-11 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            isPopular || item.isContactUs
              ? "bg-linear-to-r from-[#00D2EE] via-[#00B4D8] to-[#0A54B1] hover:opacity-95 text-white shadow-md shadow-sky-400/20 border-0"
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
