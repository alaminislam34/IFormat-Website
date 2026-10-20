"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
  List,
  FileText,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanDTO } from "@/types/api";
import { PricingCard, PricingCardItem } from "@/features/landing/components/pricing-card";
import { DEFAULT_BRANDING_PLANS, getPlanFeatureList } from "@/features/billing/utils/branding-plans";

/** Splits pasted text into clean feature lines, dropping bullets and numbering. */
export function parseFeatureLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^([-*•✓✔▪◦>]|\d+[.)])\s*/, "")
        .trim()
    )
    .filter((line) => line !== "");
}

interface PlanFeaturesEditorProps {
  features: string[];
  onChange: (features: string[]) => void;
  /** Used for the live card preview */
  preview: {
    code: string;
    name: string;
    description: string;
    priceInDollars: number;
    billingInterval: string;
  };
  /** Other plans to copy features from */
  otherPlans: PlanDTO[];
}

export function PlanFeaturesEditor({ features, onChange, preview, otherPlans }: PlanFeaturesEditorProps) {
  const [mode, setMode] = useState<"list" | "bulk">("list");
  const [bulkText, setBulkText] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const switchMode = (next: "list" | "bulk") => {
    if (next === "bulk") setBulkText(features.join("\n"));
    setMode(next);
  };

  const addFeatures = (lines: string[]) => {
    if (lines.length === 0) return;
    onChange([...features, ...lines]);
  };

  const handleAdd = () => {
    addFeatures(parseFeatureLines(newFeatureText));
    setNewFeatureText("");
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= features.length || from === to) return;
    const updated = [...features];
    const [item] = updated.splice(from, 1);
    updated.splice(to, 0, item);
    onChange(updated);
  };

  const handleCopyFrom = (planId: string) => {
    const source = otherPlans.find((p) => p.id === planId);
    if (!source) return;
    const copied = getPlanFeatureList(source.customFeatures);
    if (copied.length === 0) return;
    if (features.length > 0 && !window.confirm(`Replace the current ${features.length} features with ${source.name}'s?`)) {
      return;
    }
    onChange(copied);
    if (mode === "bulk") setBulkText(copied.join("\n"));
  };

  const defaults = DEFAULT_BRANDING_PLANS.find((p) => p.code === preview.code);
  const isContactUs = Boolean(defaults?.isContactUs) || (preview.priceInDollars <= 0 && preview.code === "BRANDING_ENTERPRISE");
  const previewItem: PricingCardItem = {
    code: preview.code || "PREVIEW",
    name: preview.name || "Plan name",
    subtitle: preview.description,
    price: isContactUs ? "" : `$${preview.priceInDollars || 0}`,
    priceSuffix: preview.billingInterval === "YEARLY" ? "/year" : "/month",
    isPopular: defaults?.isPopular,
    isContactUs,
    buttonText: defaults?.buttonText || "Get Started",
    features: features.filter((f) => f.trim() !== ""),
  };

  const copySources = otherPlans.filter((p) => getPlanFeatureList(p.customFeatures).length > 0);

  return (
    <div className="space-y-3 pt-2 border-t border-slate-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-700">Display Features (Bullet Points)</h4>
          <p className="text-[11px] text-slate-500">
            {mode === "bulk"
              ? "One feature per line. Paste a whole list at once."
              : "Drag or use the arrows to reorder. Pasting several lines adds them all."}
          </p>
        </div>
        <span className="text-[11px] font-medium text-slate-400 shrink-0">{features.length} features</span>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-xl bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => switchMode("list")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
              mode === "list" ? "bg-white text-sky-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <List className="w-3.5 h-3.5" /> List
          </button>
          <button
            type="button"
            onClick={() => switchMode("bulk")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer ${
              mode === "bulk" ? "bg-white text-sky-700 shadow-xs" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Bulk edit
          </button>
        </div>

        {copySources.length > 0 && (
          <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Copy className="w-3.5 h-3.5" />
            <select
              value=""
              onChange={(e) => handleCopyFrom(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-700 focus:outline-hidden focus:border-sky-500 cursor-pointer"
            >
              <option value="">Copy from plan…</option>
              {copySources.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="ml-auto px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 text-sky-700 hover:bg-sky-50 cursor-pointer"
        >
          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showPreview ? "Hide preview" : "Preview card"}
        </button>
      </div>

      {mode === "bulk" ? (
        <textarea
          rows={10}
          value={bulkText}
          onChange={(e) => {
            setBulkText(e.target.value);
            onChange(parseFeatureLines(e.target.value));
          }}
          placeholder={"Cancel anytime (1 month)\nDedicated brand consultant\nInterview coaching for jobs (2)"}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs leading-relaxed focus:outline-hidden focus:border-sky-500 resize-y font-mono"
        />
      ) : (
        <>
          {/* Add input: Enter adds one, pasting multiple lines adds all of them */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              onPaste={(e) => {
                const text = e.clipboardData.getData("text");
                const lines = parseFeatureLines(text);
                if (lines.length > 1) {
                  e.preventDefault();
                  addFeatures(lines);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAdd();
                }
              }}
              placeholder="Type a feature and press Enter, or paste a list"
              className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs focus:outline-hidden focus:border-sky-500"
            />
            <Button
              type="button"
              onClick={handleAdd}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-3 h-9 rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            {features.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2 text-center bg-slate-50 rounded-xl">
                No feature bullets yet. Type above, or switch to Bulk edit to paste a list.
              </p>
            ) : (
              features.map((feat, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => setDragIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex !== null) move(dragIndex, idx);
                    setDragIndex(null);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={`flex items-center gap-1.5 rounded-lg ${dragIndex === idx ? "opacity-40" : ""}`}
                >
                  <GripVertical className="w-3.5 h-3.5 text-slate-300 cursor-grab shrink-0" />
                  <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{idx + 1}.</span>
                  <input
                    type="text"
                    value={feat}
                    onChange={(e) => {
                      const updated = [...features];
                      updated[idx] = e.target.value;
                      onChange(updated);
                    }}
                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => move(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, idx + 1)}
                    disabled={idx === features.length - 1}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    title="Move down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(features.filter((_, i) => i !== idx))}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove feature"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {showPreview && (
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-4 text-center">
            How it looks on the pricing page
          </p>
          {/* Preview only: the card's button must not submit this form */}
          <div className="max-w-xs mx-auto pointer-events-none select-none" aria-hidden>
            <PricingCard item={previewItem} onSelect={() => {}} />
          </div>
        </div>
      )}
    </div>
  );
}
