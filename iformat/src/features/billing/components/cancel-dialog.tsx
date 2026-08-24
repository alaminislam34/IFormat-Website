import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export function CancelDialog({ isOpen, onClose, onConfirm, loading }: CancelDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 text-rose-600">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <h4 className="text-lg font-bold text-slate-900">Cancel Membership?</h4>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Your plan will remain active until the end of your current billing period. After that,
          your account will revert to the Free Forever tier, and active quotas will be reduced.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="rounded-xl text-xs font-semibold">
            Keep Subscription
          </Button>

          <Button
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancellation"}
          </Button>
        </div>
      </div>
    </div>
  );
}
