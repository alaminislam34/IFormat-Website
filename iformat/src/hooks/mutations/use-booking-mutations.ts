"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { BookSlotRequest, CreateSlotRequest } from "@/types/api";
import { BOOKING_QUERY_KEYS } from "../queries/use-bookings";

export function useBookSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BookSlotRequest) => bookingService.bookSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.slots() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.mine() });
    },
  });
}

export function useCreateSlot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSlotRequest) => bookingService.createSlot(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.slots() });
    },
  });
}
