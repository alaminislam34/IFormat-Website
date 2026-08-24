import React from "react";
import { ShieldAlert, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserItemDTO } from "@/services/admin.service";

interface BanUserModalProps {
  user: AdminUserItemDTO | null;
  onClose: () => void;
  banReason: string;
  setBanReason: (reason: string) => void;
  onConfirm: () => void;
  loading: boolean;
}

export function BanUserModal({
  user,
  onClose,
  banReason,
  setBanReason,
  onConfirm,
  loading,
}: BanUserModalProps) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
            <ShieldAlert className="w-5 h-5" />
            <span>{user.isBanned ? "Lift Account Suspension" : "Suspend User Account"}</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          {user.isBanned
            ? `Are you sure you want to unban ${user.name} (${user.email})?`
            : `Suspending ${user.name} will immediately revoke active JWT sessions and prevent future logins.`}
        </p>

        {!user.isBanned && (
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1">
              Reason for Suspension
            </label>
            <Input
              type="text"
              placeholder="e.g. Terms violation, spam posting..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-xs rounded-xl"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-xl text-xs font-bold bg-slate-800 border-slate-700 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl text-xs font-bold text-white ${
              user.isBanned ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500"
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : user.isBanned ? (
              "Confirm Unban"
            ) : (
              "Confirm Suspension"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
