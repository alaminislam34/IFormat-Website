"use client";

import { useQuery } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { useAuthStore } from "@/stores/use-auth-store";

export const BOOKING_QUERY_KEYS = {
  all: ["bookings"] as const,
  slots: () => [...BOOKING_QUERY_KEYS.all, "slots"] as const,
  mine: () => [...BOOKING_QUERY_KEYS.all, "mine"] as const,
};

export function useAvailableSlots() {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.slots(),
    queryFn: () => bookingService.listAvailableSlots(),
    staleTime: 1000 * 60 * 3, // 3 mins
  });
}

export function useMyBookings() {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.mine(),
    queryFn: () => bookingService.listMyBookings(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}
