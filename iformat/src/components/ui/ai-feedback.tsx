"use client";

import * as React from "react";
import { ThumbsUp, ThumbsDown, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aiService } from "@/services/ai.service";
import { AiFeedbackRating } from "@/types/api";
import { cn } from "@/lib/utils";

interface AiFeedbackProps {
  /** Id returned with the AI result. Nothing is rendered without it (e.g. demo output). */
  usageId?: string;
  className?: string;
}

export function AiFeedback({ usageId, className }: AiFeedbackProps) {
  const [rating, setRating] = React.useState<AiFeedbackRating | null>(null);
  const [comment, setComment] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [isDone, setIsDone] = React.useState(false);

  // A new AI result starts with a fresh prompt.
  React.useEffect(() => {
    setRating(null);
    setComment("");
    setIsDone(false);
  }, [usageId]);

  if (!usageId) return null;

  const send = async (value: AiFeedbackRating, note?: string) => {
    try {
      setIsSending(true);
      await aiService.submitFeedback({ usageId, rating: value, comment: note?.trim() || undefined });
      setIsDone(true);
    } catch (err: any) {
      toast.error(err?.message || "Could not send your feedback. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleRate = (value: AiFeedbackRating) => {
    setRating(value);
    // A thumbs up is sent right away; a thumbs down asks what went wrong first.
    if (value === "UP") void send(value);
  };

  if (isDone) {
    return (
      <p className={cn("flex items-center gap-1.5 text-xs font-medium text-emerald-600", className)}>
        <Check className="w-3.5 h-3.5" /> Thanks for your feedback
      </p>
    );
  }

  const buttonClass = (value: AiFeedbackRating, activeClass: string) =>
    cn(
      "h-8 w-8 rounded-lg border flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
      rating === value
        ? activeClass
        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    );

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Was this helpful?</span>
        <button
          type="button"
          aria-label="Helpful"
          disabled={isSending}
          onClick={() => handleRate("UP")}
          className={buttonClass("UP", "border-emerald-200 bg-emerald-50 text-emerald-600")}
        >
          {isSending && rating === "UP" ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ThumbsUp className="w-3.5 h-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label="Not helpful"
          disabled={isSending}
          onClick={() => handleRate("DOWN")}
          className={buttonClass("DOWN", "border-rose-200 bg-rose-50 text-rose-600")}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {rating === "DOWN" && (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="What could be better? (optional)"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-500 resize-none"
          />
          <button
            type="button"
            disabled={isSending}
            onClick={() => send("DOWN", comment)}
            className="h-8 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Send feedback
          </button>
        </div>
      )}
    </div>
  );
}
