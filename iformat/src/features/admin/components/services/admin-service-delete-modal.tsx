"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceProductWithStatus } from "@/stores/use-services-store";

interface AdminServiceDeleteModalProps {
  service: ServiceProductWithStatus | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
}

export function AdminServiceDeleteModal({
  service,
  onClose,
  onConfirm,
}: AdminServiceDeleteModalProps) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-100000 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 text-center animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Delete Service?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">"{service.title}"</span>? This
            action cannot be undone.
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="flex-1 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onConfirm(service.id)}
            className="flex-1 rounded-xl cursor-pointer"
          >
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
