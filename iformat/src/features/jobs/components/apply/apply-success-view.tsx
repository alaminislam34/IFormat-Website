"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ApplySuccessViewProps {
  companyName: string;
}

export function ApplySuccessView({ companyName }: ApplySuccessViewProps) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      <h4 className="text-lg font-bold text-slate-900">Application Submitted!</h4>
      <p className="text-sm text-slate-500 max-w-xs mx-auto">
        Your application has been delivered to <strong>{companyName}</strong>. Our AI Talent Engine is screening your profile now.
      </p>
    </div>
  );
}
