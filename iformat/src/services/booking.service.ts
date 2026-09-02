import { apiClient } from "@/lib/api/api-client";
import { BookingDTO, BookSlotRequest, ConsultationSlotDTO, CreateSlotRequest } from "@/types/api";

export const bookingService = {
  /**
   * Public: List available upcoming consultation slots
   */
  async listAvailableSlots(): Promise<ConsultationSlotDTO[]> {
    return apiClient.get<ConsultationSlotDTO[]>("/bookings/slots");
  },

  /**
   * Candidate: List authenticated candidate's booked sessions
   */
  async listMyBookings(): Promise<BookingDTO[]> {
    return apiClient.get<BookingDTO[]>("/bookings/mine");
  },

  /**
   * Candidate: Book a specific consultation slot
   */
  async bookSlot(payload: BookSlotRequest): Promise<BookingDTO> {
    return apiClient.post<BookingDTO>("/bookings/book", payload);
  },

  /**
   * Advisor / Employer / Admin: Create a new availability slot
   */
  async createSlot(payload: CreateSlotRequest): Promise<ConsultationSlotDTO> {
    return apiClient.post<ConsultationSlotDTO>("/bookings/slots", payload);
  },

  /**
   * Admin / Advisor: Update booking status
   */
  async updateStatus(bookingId: string, status: "CONFIRMED" | "COMPLETED" | "CANCELLED"): Promise<BookingDTO> {
    return apiClient.patch<BookingDTO>(`/bookings/${bookingId}/status`, { status });
  },
};
