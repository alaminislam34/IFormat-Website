"use client";

import React, { useEffect, useState } from "react";
import { Loader2, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminUserItemDTO, UserLimitOverrides } from "@/services/admin.service";
import { LimitDraft, formatLimit, limitFieldsForRole, toDraft } from "./user-limits";

interface UserLimitsModalProps {
  user: AdminUserItemDTO | null;
  loading: boolean;
  onClose: () => void;
  onSave: (payload: UserLimitOverrides) => void;
}

export function UserLimitsModal({ user, loading, onClose, onSave }: UserLimitsModalProps) {
  const [draft, setDraft] = useState<LimitDraft>(toDraft());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(toDraft(user?.limitOverrides));
    setError(null);
  }, [user]);

  if (!user) return null;
  const fields = limitFieldsForRole(user.role);

  const handleSave = () => {
    const payload: UserLimitOverrides = {};
    for (const { key } of fields) {
      const raw = draft[key].trim();
      if (raw === "") continue;
      if (raw === "unlimited") {
        payload[key] = null;
        continue;
      }
      const n = Number(raw);
      if (!Number.isInteger(n) || n < 0) {
        setError("Limits must be whole numbers (0 or more), or Unlimited.");
        return;
      }
      payload[key] = n;
    }
    // Keep overrides for fields not shown for this role
    for (const key of Object.keys(user.limitOverrides ?? {}) as (keyof UserLimitOverrides)[]) {
      if (!fields.some((f) => f.key === key)) payload[key] = user.limitOverrides![key];
    }
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sky-600 font-bold text-base">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Limits & Usage</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Limits for <span className="font-semibold text-slate-900">{user.name}</span> ({user.email}). Setting a value
          overrides their plan; leave it empty to use the plan default.
        </p>

        <div className="space-y-3">
          {fields.map(({ key, label, hint }) => {
            const unlimited = draft[key] === "unlimited";
            const status = formatLimit(user, key);
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {label} <span className="font-normal text-slate-400">— {hint}</span>
                  </label>
                  {status && (
                    <span className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">
                      {status.used} used •{" "}
                      {status.remaining === null ? "unlimited" : `${status.remaining} left`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    disabled={unlimited}
                    placeholder="Plan default"
                    value={unlimited ? "" : draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="bg-slate-50 border-slate-200 text-slate-900 text-xs rounded-xl"
                  />
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unlimited}
                      onChange={(e) => setDraft({ ...draft, [key]: e.target.checked ? "unlimited" : "" })}
                    />
                    Unlimited
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {error && <p className="text-xs font-medium text-rose-600">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="rounded-xl text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Limits"}
          </Button>
        </div>
      </div>
    </div>
  );
}
