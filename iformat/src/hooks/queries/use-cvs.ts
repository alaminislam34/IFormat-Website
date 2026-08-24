"use client";

import { useQuery } from "@tanstack/react-query";
import { cvService } from "@/services/cv.service";
import { useAuthStore } from "@/stores/use-auth-store";

export const CV_QUERY_KEYS = {
  all: ["cvs"] as const,
  lists: () => [...CV_QUERY_KEYS.all, "list"] as const,
  detail: (id: string) => [...CV_QUERY_KEYS.all, "detail", id] as const,
};

export function useUserCVs() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: CV_QUERY_KEYS.lists(),
    queryFn: () => cvService.listUserCVs(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

export function useCVDetail(id: string) {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: CV_QUERY_KEYS.detail(id),
    queryFn: () => cvService.getCVById(id),
    enabled: isAuthenticated && Boolean(id),
  });
}
