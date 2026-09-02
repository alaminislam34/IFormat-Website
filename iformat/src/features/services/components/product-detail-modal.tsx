"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Calendar,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServiceProduct {
  id: string;
  title: string;
  price: string;
  priceNum: number;
  deliveryTime: string;
  image: string;
  category: string;
  badge?: string;
  tagline: string;
  description: string;
  deliverables: string[];
  audience: string;
  methodology: string;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ServiceProduct | null;
  onOrderNow: (product: ServiceProduct) => void;
  onBookConsultation: (product: ServiceProduct) => void;
}

export function ProductDetailModal({
  isOpen,
  onClose,
  product,
  onOrderNow,
  onBookConsultation,
}: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 z-10 my-8 max-h-[90vh] flex flex-col"
          >
            {/* Header Image & Close Button */}
            <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0 overflow-hidden">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white/80 hover:text-white hover:bg-black/60 transition-colors backdrop-blur-md cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Badges on Image */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#52CEDE] text-slate-950 shadow-md">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#0A54B1] text-white shadow-md">
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Header Title inside banner */}
              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {product.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-200/90 font-medium mt-0.5">
                    {product.tagline}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-white">
                    {product.price}
                  </span>
                  <p className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">
                    One-time
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
              {/* Quick Specs Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-[#0A54B1] shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Turnaround</p>
                    <p className="font-bold">{product.deliveryTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">ATS Pass Rate</p>
                    <p className="font-bold">99.8% Guaranteed</p>
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1 flex items-center gap-2 text-slate-700">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Methodology</p>
                    <p className="font-bold">NLP & Psycholinguistics</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Service Overview
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  What is Included in this Package
                </h4>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {product.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100 text-xs text-slate-800 font-medium"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience & Methodology */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/60 text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-[#0A54B1]">
                  Ideal for: <span className="font-normal text-slate-700">{product.audience}</span>
                </p>
                <p className="text-slate-600">
                  <strong>Scientific Approach:</strong> {product.methodology}
                </p>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onBookConsultation(product);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#0A54B1]" /> Book Consultation Session
              </button>

              <Button
                onClick={() => {
                  onClose();
                  onOrderNow(product);
                }}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-linear-to-r from-[#52CEDE] to-[#0A54B1] hover:opacity-95 text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Order Now ({product.price}) <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
