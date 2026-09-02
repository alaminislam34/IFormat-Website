"use client";

import React, { useState, useEffect, useRef } from "react";
import { FileText, Mic, MicOff, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface StepSummaryProps {
  summary: string;
  onChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export function StepSummary({ summary, onChange, onPrev, onNext }: StepSummaryProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          setIsListening(true);
          toast.info("Voice dictation active. Speak clearly into your mic...");
        };

        recognition.onresult = (event: any) => {
          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            onChange(summary ? `${summary} ${finalTranscript}` : finalTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error("Microphone access denied. Please enable microphone permissions in your browser.");
          } else {
            toast.error(`Voice recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [summary, onChange]);

  const toggleListening = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      toast.success("Voice recording stopped.");
    } else {
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      key="step2"
      className="space-y-8"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Professional Summary</h2>
            <p className="text-xs text-slate-500">Type or dictate your career highlights and expertise.</p>
          </div>
        </div>

        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening...</span>
          </motion.div>
        )}
      </div>

      <div className="relative">
        <textarea
          rows={8}
          value={summary ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write or dictate about yourself, your career highlights, major achievements, and core skills..."
          className={`w-full p-5 rounded-2xl border text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0A54B1]/20 focus:border-[#0A54B1] focus:bg-white transition-all text-sm font-medium leading-relaxed resize-none ${
            isListening
              ? "border-rose-300 bg-rose-50/20 ring-2 ring-rose-200/50"
              : "border-slate-200 bg-slate-50/50"
          }`}
        />

        <div className="absolute right-4 bottom-4 flex items-center gap-2">
          {isListening && (
            <span className="text-[11px] font-semibold text-rose-500 bg-white/80 px-2 py-1 rounded-md shadow-xs hidden sm:inline">
              Speak now...
            </span>
          )}
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? "Stop listening" : "Click to dictate with voice"}
            className={`p-3 rounded-full transition-all cursor-pointer shadow-sm ${
              isListening
                ? "bg-rose-500 text-white hover:bg-rose-600 ring-4 ring-rose-200 animate-pulse"
                : "bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-[#0A54B1]"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-100">
        <Button onClick={onPrev} variant="outline" className="px-6 h-11 border-slate-200 text-slate-700">
          Previous
        </Button>
        <Button onClick={onNext} className="bg-[#0A54B1] hover:bg-[#0A54B1]/90 px-8 h-11 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer">
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
