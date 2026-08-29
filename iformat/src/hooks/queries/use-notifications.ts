"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import { useAuthStore } from "@/stores/use-auth-store";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  mine: () => [...NOTIFICATION_QUERY_KEYS.all, "mine"] as const,
};

/**
 * Fetches notifications for the authenticated user.
 * Polls every 30 seconds so the bell stays fresh without a full page reload.
 * Only runs when the user is authenticated.
 */
export function useNotifications() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.mine(),
    queryFn: () => notificationService.getMyNotifications(),
    enabled: isAuthenticated,
    refetchInterval: 30_000, // poll every 30 s
    staleTime: 15_000,
    select: (data) => data ?? [],
  });
}

/** Mark a single notification as read, then refetch the list. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.mine() });
    },
  });
}

/** Mark ALL notifications as read, then refetch the list. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.mine() });
    },
  });
}
