"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Edit2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServicePreviewModalProps {
  service: ServiceProductWithStatus | null;
  onClose: () => void;
  onEdit: (service: ServiceProductWithStatus) => void;
}

export function AdminServicePreviewModal({
  service,
  onClose,
  onEdit,
}: AdminServicePreviewModalProps) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header Image or Banner */}
        <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
          {service.image ? (
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover opacity-85"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-sky-600 to-[#0A54B1] text-white">
              <ShoppingBag className="w-12 h-12 opacity-40" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors cursor-pointer border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
              {service.category}
            </span>

            {service.badge && (
              <span className="px-2.5 py-1 rounded-xl text-xs font-bold uppercase tracking-wider bg-amber-400 text-slate-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {service.badge}
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {service.title}
              </h3>
              <span className="text-base font-extrabold text-[#0A54B1] bg-sky-50 border border-sky-100 px-3 py-1 rounded-xl">
                {service.price}
              </span>
            </div>
            {service.tagline && (
              <p className="text-xs font-semibold text-sky-700 mt-1">
                {service.tagline}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {service.deliveryTime}
              </span>
              <span>•</span>
              <span
                className={`inline-flex items-center gap-1 font-semibold ${
                  service.isActive !== false ? "text-emerald-600" : "text-slate-500"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    service.isActive !== false ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {service.isActive !== false ? "Published / Active" : "Draft / Hidden"}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Overview & Description
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
              {service.description || "No full description provided."}
            </p>
          </div>

          {/* Deliverables */}
          {service.deliverables && service.deliverables.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Included Deliverables ({service.deliverables.length})
              </h4>
              <div className="space-y-1.5">
                {service.deliverables.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs text-slate-700 bg-slate-50/60 border border-slate-100 px-3 py-2 rounded-xl"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-xl cursor-pointer"
          >
            Close
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onEdit(service);
              onClose();
            }}
            className="bg-[#0A54B1] hover:bg-[#08438e] text-white rounded-xl cursor-pointer flex items-center gap-1.5 font-bold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Service</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
