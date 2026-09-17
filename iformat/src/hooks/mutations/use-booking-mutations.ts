"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingService } from "@/services/booking.service";
import { BookSlotRequest, CreateSlotRequest, CreateServiceOrderRequest } from "@/types/api";
import { BOOKING_QUERY_KEYS } from "../queries/use-bookings";
import { toast } from "sonner";

export function useCheckoutServiceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServiceOrderRequest) => bookingService.checkoutServiceOrder(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.mine() });
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || err?.message || "Failed to initiate service checkout.");
    },
  });
}

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

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: "CONFIRMED" | "COMPLETED" | "CANCELLED" }) =>
      bookingService.updateStatus(bookingId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.mine() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.slots() });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
      toast.success("Order status updated successfully");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update order status");
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: string | { bookingId: string; reason?: string }) => {
      const bookingId = typeof args === "string" ? args : args.bookingId;
      const reason = typeof args === "string" ? undefined : args.reason;
      return bookingService.updateStatus(bookingId, "PENDING", reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.mine() });
      queryClient.invalidateQueries({ queryKey: BOOKING_QUERY_KEYS.slots() });
      queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}
