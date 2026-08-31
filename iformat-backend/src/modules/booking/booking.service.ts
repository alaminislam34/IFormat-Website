import { prisma } from "../../lib/prisma.js";
import { BookingStatus } from "@prisma/client";
import { NotFoundError, ConflictError } from "../../errors/index.js";
import { sendEmail } from "../../lib/mailer.js";
import { env, getFrontendUrl } from "../../config/env.js";

export class BookingService {
  static async listAvailableSlots() {
    return prisma.consultationSlot.findMany({
      where: {
        isBooked: false,
        startTime: { gte: new Date() },
      },
      include: {
        advisor: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });
  }

  static async createSlot(advisorId: string, input: {
    title: string;
    startTime: string;
    endTime: string;
    priceInCents?: number;
  }) {
    return prisma.consultationSlot.create({
      data: {
        advisorId,
        title: input.title,
        startTime: new Date(input.startTime),
        endTime: new Date(input.endTime),
        priceInCents: input.priceInCents || 4900,
      },
    });
  }

  static async bookSlot(userId: string, input: { slotId: string; notes?: string }) {
    // Execute inside an isolated database transaction to guarantee no double-booking race condition
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.consultationSlot.findUnique({
        where: { id: input.slotId },
        include: { advisor: true },
      });

      if (!slot) {
        throw new NotFoundError("ConsultationSlot", input.slotId);
      }

      if (slot.isBooked) {
        throw new ConflictError("This consultation slot has already been booked by another user");
      }

      // Mark slot as booked
      await tx.consultationSlot.update({
        where: { id: input.slotId },
        data: { isBooked: true },
      });

      // Create booking record
      const booking = await tx.booking.create({
        data: {
          slotId: input.slotId,
          userId,
          notes: input.notes,
          status: BookingStatus.CONFIRMED,
        },
        include: {
          slot: {
            include: { advisor: true },
          },
          user: true,
        },
      });

      return booking;
    });

    // Send confirmation email
    sendEmail({
      to: result.user.email,
      subject: `Consultation Confirmed: ${result.slot.title}`,
      template: "booking-confirmation",
      data: {
        name: result.user.name,
        slotTitle: result.slot.title,
        advisorName: result.slot.advisor.name,
        sessionTime: new Date(result.slot.startTime).toLocaleString(),
        bookingUrl: `${getFrontendUrl()}/services`,
      },
    });

    return result;
  }

  static async listUserBookings(userId: string) {
    return prisma.booking.findMany({
      where: { userId },
      include: {
        slot: {
          include: {
            advisor: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
