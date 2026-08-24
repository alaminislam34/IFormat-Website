"use client";

import { useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/ai.service";
import {
  GenerateCoverLetterRequest,
  GenerateEmailRequest,
  OptimizeResumeRequest,
} from "@/types/api";

export function useGenerateCoverLetter() {
  return useMutation({
    mutationFn: (payload: GenerateCoverLetterRequest) =>
      aiService.generateCoverLetter(payload),
  });
}

export function useGenerateEmail() {
  return useMutation({
    mutationFn: (payload: GenerateEmailRequest) =>
      aiService.generateEmail(payload),
  });
}

export function useOptimizeResume() {
  return useMutation({
    mutationFn: (payload: OptimizeResumeRequest) =>
      aiService.optimizeResume(payload),
  });
}
