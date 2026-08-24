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
  slotId: string;
  userId: string;
  notes?: string | null;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  createdAt: string;
  slot: ConsultationSlotDTO;
  user?: {
    id: string;
    name: string;
    email: string;
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
