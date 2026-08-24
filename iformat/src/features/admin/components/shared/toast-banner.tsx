import React from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastBannerProps {
  message: string | null;
  onClose: () => void;
}

export function ToastBanner({ message, onClose }: ToastBannerProps) {
  if (!message) return null;

  return (
    <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>{message}</span>
      </div>
      <button onClick={onClose} className="text-emerald-400 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
