"use client";

import { useState } from "react";
import {
  Settings,
  Bot,
  Cpu,
  CheckCircle2,
  Sliders,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4o-mini");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>System configuration updated successfully.</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform & AI Settings
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Configure AI screening models, match thresholds, and operational parameters.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AI Screening Configuration */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Screening Engine</h3>
              <p className="text-xs text-slate-400">Select model for candidate resume matching</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                id: "gpt-4o-mini",
                name: "GPT-4o Mini (Default)",
                desc: "High throughput, cost-efficient candidate screening & skill extraction",
                speed: "Fast",
                cost: "$0.15 / 1M tokens",
              },
              {
                id: "gpt-4o",
                name: "GPT-4o Omni",
                desc: "Deep reasoning, comprehensive executive-level candidate evaluation",
                speed: "Standard",
                cost: "$2.50 / 1M tokens",
              },
            ].map((m) => (
              <label
                key={m.id}
                onClick={() => setSelectedModel(m.id)}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  selectedModel === m.id
                    ? "bg-sky-950/40 border-sky-500 ring-1 ring-sky-500"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="model"
                  checked={selectedModel === m.id}
                  onChange={() => setSelectedModel(m.id)}
                  className="mt-1 text-sky-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-white">{m.name}</p>
                    <span className="text-[10px] font-semibold text-emerald-400">{m.speed}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{m.desc}</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">{m.cost}</p>
                </div>
              </label>
            ))}
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-10 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold"
          >
            Save Model Preference
          </Button>
        </div>

        {/* Security & System Status */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Security & Telemetry</h3>
              <p className="text-xs text-slate-400">Environment health and token policies</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Access Token Lifespan</span>
              <span className="font-bold text-white">15 minutes (HTTP-only)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Refresh Token Lifespan</span>
              <span className="font-bold text-white">7 days (Rotated)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Stripe Webhook Idempotency</span>
              <span className="font-bold text-emerald-400">Active (Deduplicated)</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Database Soft Deletion</span>
              <span className="font-bold text-emerald-400">Enforced Globally</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
