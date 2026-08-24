"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cvService } from "@/services/cv.service";
import { CreateCVRequest, SaveCVVersionRequest } from "@/types/api";
import { CV_QUERY_KEYS } from "../queries/use-cvs";

export function useCreateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCVRequest) => cvService.createCV(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CV_QUERY_KEYS.lists() });
    },
  });
}

export function useSaveCVVersion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cvId, payload }: { cvId: string; payload: SaveCVVersionRequest }) =>
      cvService.saveNewVersion(cvId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CV_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: CV_QUERY_KEYS.detail(variables.cvId) });
    },
  });
}

export function useDeleteCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cvId: string) => cvService.deleteCV(cvId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CV_QUERY_KEYS.lists() });
    },
  });
}
