export interface ConsultationSlotDTO {
  id: string;
  advisorId: string;
  title: string;
  startTime: string;
  endTime: string;
  priceInCents: number;
  isBooked: boolean;
  advisor?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface BookingDTO {
  id: string;
  slotId?: string | null;
  userId: string;
  serviceId?: string | null;
  serviceTitle?: string | null;
  priceInCents?: number;
  clientPhone?: string | null;
  requirements?: string | null;
  notes?: string | null;
  paymentStatus?: string;
  stripeSessionId?: string | null;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  slot?: ConsultationSlotDTO | null;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
}

export interface BookSlotRequest {
  slotId: string;
  notes?: string;
}

export interface CreateSlotRequest {
  title: string;
  startTime: string;
  endTime: string;
  priceInCents?: number;
}

export interface CreateServiceOrderRequest {
  serviceId: string;
  serviceTitle: string;
  priceInCents: number;
  requirements?: string;
  clientPhone?: string;
  notes?: string;
}

export interface ServiceOrderCheckoutResponse {
  checkoutUrl: string;
  booking: BookingDTO;
}
