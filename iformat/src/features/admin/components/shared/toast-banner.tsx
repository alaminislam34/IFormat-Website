import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastBannerProps {
  message: string | null;
  onClose: () => void;
}

export function ToastBanner({ message, onClose }: ToastBannerProps) {
  if (!message) return null;

  return (
    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
