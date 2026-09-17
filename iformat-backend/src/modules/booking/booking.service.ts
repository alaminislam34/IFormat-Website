import { prisma } from "../../lib/prisma.js";
import { BookingStatus, Role } from "@prisma/client";
import { NotFoundError, ConflictError, ForbiddenError } from "../../errors/index.js";
import { sendEmail } from "../../lib/mailer.js";
import { env, getFrontendUrl } from "../../config/env.js";
import { stripe } from "../../lib/stripe.js";

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
    if (result.slot) {
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

      // Dispatch in-app notifications
      try {
        const formattedTime = new Date(result.slot.startTime).toLocaleString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        // To candidate
        await prisma.notification.create({
          data: {
            userId: result.userId,
            type: "BOOKING",
            title: "📅 Consultation Confirmed!",
            message: `Your session "${result.slot.title}" with advisor ${result.slot.advisor.name} is confirmed for ${formattedTime}.`,
            payload: { actionUrl: "/dashboard/bookings" },
          },
        });

        // To advisor (if advisor is another user)
        if (result.slot.advisorId && result.slot.advisorId !== result.userId) {
          await prisma.notification.create({
            data: {
              userId: result.slot.advisorId,
              type: "BOOKING",
              title: "📅 New Consultation Booking",
              message: `${result.user.name} booked your session "${result.slot.title}" scheduled for ${formattedTime}.`,
              payload: { actionUrl: "/dashboard/bookings" },
            },
          });
        }
      } catch (notifErr: any) {
        console.warn("Failed to dispatch booking notifications:", notifErr.message);
      }
    }

    return result;
  }

  static async listUserBookings(user: { id: string; role: any }) {
    const where: any = user.role === "ADMIN" ? { isDeleted: false } : { userId: user.id, isDeleted: false };
    return prisma.booking.findMany({
      where,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
    currentUser?: { id: string; role: Role },
    reason?: string
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        slot: { include: { advisor: true } },
        user: true,
      },
    });

    if (!booking) {
      throw new NotFoundError("Booking", bookingId);
    }

    // Role-based authorization & ownership checks
    if (currentUser) {
      if (currentUser.role === Role.CANDIDATE) {
        if (booking.userId !== currentUser.id) {
          throw new ForbiddenError("You can only cancel your own bookings");
        }
        if (status !== BookingStatus.CANCELLED && status !== BookingStatus.PENDING) {
          throw new ForbiddenError("Candidates are only permitted to request cancellation or cancel sessions");
        }
      } else if (currentUser.role === Role.EMPLOYER) {
        if (booking.slot?.advisorId && booking.slot.advisorId !== currentUser.id) {
          throw new ForbiddenError("You are not the designated advisor for this consultation");
        }
      }
    }

    // If cancelled and associated with a slot, release slot so it can be re-booked
    if (status === BookingStatus.CANCELLED && booking.slotId) {
      try {
        await prisma.consultationSlot.update({
          where: { id: booking.slotId },
          data: { isBooked: false },
        });
      } catch (err: any) {
        console.warn("Failed to release consultation slot on cancellation:", err.message);
      }
    }

    // Prepare notes update if a reason was submitted
    let updatedNotes = booking.notes;
    if (reason && reason.trim()) {
      const reasonTag = status === BookingStatus.PENDING 
        ? `[Cancellation Requested - ${new Date().toLocaleDateString()}]: ${reason.trim()}`
        : `[Cancellation Reason]: ${reason.trim()}`;
      updatedNotes = booking.notes ? `${booking.notes}\n${reasonTag}` : reasonTag;
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status,
        ...(updatedNotes !== booking.notes ? { notes: updatedNotes } : {}),
      },
      include: {
        slot: { include: { advisor: true } },
        user: true,
      },
    });

    // Notify participants of status update
    try {
      const orderTitle = booking.serviceTitle || booking.slot?.title || "Professional Service";
      const isCandidatePending = status === BookingStatus.PENDING && currentUser?.id === booking.userId;
      const isCandidateCancelling = status === BookingStatus.CANCELLED && currentUser?.id === booking.userId;

      if (isCandidatePending) {
        // 1. Notify all admins of the cancellation request
        const admins = await prisma.user.findMany({
          where: { role: Role.ADMIN, isDeleted: false },
          select: { id: true },
        });
        for (const admin of admins) {
          await prisma.notification.create({
            data: {
              userId: admin.id,
              type: "BOOKING",
              title: "⚠️ Order Cancellation Requested",
              message: `${booking.user.name} requested to cancel "${orderTitle}". Reason: ${reason || "No reason specified."}`,
              payload: { actionUrl: "/admin/bookings" },
            },
          });
        }

        // 2. Notify advisor if consultation slot
        if (booking.slot?.advisorId && booking.slot.advisorId !== booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.slot.advisorId,
              type: "BOOKING",
              title: "⚠️ Client Requested Cancellation",
              message: `${booking.user.name} has requested cancellation for consultation "${orderTitle}".`,
              payload: { actionUrl: "/dashboard/bookings" },
            },
          });
        }

        // 3. Confirm to candidate that request is submitted & pending
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            title: "Cancellation Request Received",
            message: `Your cancellation request for "${orderTitle}" has been received and is pending administrator confirmation.`,
            payload: { actionUrl: "/dashboard/bookings" },
          },
        });
      } else if (isCandidateCancelling) {
        // Direct candidate cancellation
        if (booking.slot?.advisorId && booking.slot.advisorId !== booking.userId) {
          await prisma.notification.create({
            data: {
              userId: booking.slot.advisorId,
              type: "BOOKING",
              title: "⚠️ Order / Session Cancelled by Client",
              message: `${booking.user.name} has cancelled their order/session "${orderTitle}".`,
              payload: { actionUrl: "/dashboard/bookings" },
            },
          });
        }
        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            title: "Order / Session Cancelled",
            message: `Your order for "${orderTitle}" has been cancelled.`,
            payload: { actionUrl: "/dashboard/bookings" },
          },
        });
      } else {
        // Admin or Advisor updated status -> notify candidate
        const statusTitle =
          status === BookingStatus.COMPLETED
            ? "✅ Service Order Completed"
            : status === BookingStatus.CANCELLED
            ? "⚠️ Order Cancellation Approved"
            : status === BookingStatus.CONFIRMED
            ? "✅ Service Order Active"
            : "Service Order Updated";

        const statusMsg =
          status === BookingStatus.COMPLETED
            ? `Your order "${orderTitle}" has been marked as completed.`
            : status === BookingStatus.CANCELLED
            ? `Your order for "${orderTitle}" has been cancelled by the administrator.`
            : status === BookingStatus.CONFIRMED
            ? `Your order "${orderTitle}" is active and in progress.`
            : `Your order "${orderTitle}" status has been updated to ${status.toLowerCase()}.`;

        await prisma.notification.create({
          data: {
            userId: booking.userId,
            type: "BOOKING",
            title: statusTitle,
            message: statusMsg,
            payload: { actionUrl: "/dashboard/bookings" },
          },
        });
      }
    } catch (notifErr: any) {
      console.warn("Failed to dispatch booking update notification:", notifErr.message);
    }

    return updated;
  }

  /**
   * Create a direct Paid Service Order Checkout & Fulfillment Record
   */
  static async createServiceOrderCheckout(
    userId: string,
    input: {
      serviceId: string;
      serviceTitle: string;
      priceInCents: number;
      requirements?: string;
      clientPhone?: string;
      notes?: string;
    }
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (input.clientPhone && !user.phone) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { phone: input.clientPhone },
        });
      } catch {
        // non-blocking
      }
    }

    const isMock = !env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY.startsWith("sk_test_mock");

    let checkoutUrl = `${getFrontendUrl()}/dashboard/bookings?order_success=true`;
    let stripeSessionId: string | null = null;

    if (!isMock) {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: input.serviceTitle,
                description: `iFormat Professional Service - ${input.serviceTitle}`,
              },
              unit_amount: input.priceInCents,
            },
            quantity: 1,
          },
        ],
        success_url: `${getFrontendUrl()}/dashboard/bookings?order_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getFrontendUrl()}/services?canceled=true`,
        metadata: {
          type: "SERVICE_ORDER",
          userId,
          serviceId: input.serviceId,
          serviceTitle: input.serviceTitle,
        },
      });

      checkoutUrl = session.url || checkoutUrl;
      stripeSessionId = session.id;
    }

    // Create the Service Order booking record in database
    const booking = await prisma.booking.create({
      data: {
        userId,
        serviceId: input.serviceId,
        serviceTitle: input.serviceTitle,
        priceInCents: input.priceInCents,
        clientPhone: input.clientPhone || user.phone,
        requirements: input.requirements,
        notes: input.notes,
        paymentStatus: "PAID",
        stripeSessionId,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, avatarUrl: true },
        },
      },
    });

    // Send confirmation email
    sendEmail({
      to: user.email,
      subject: `Order Confirmed: ${input.serviceTitle}`,
      template: "booking-confirmation",
      data: {
        name: user.name,
        slotTitle: input.serviceTitle,
        advisorName: "iFormat Executive Operations",
        sessionTime: "Project Received & In Review",
        bookingUrl: `${getFrontendUrl()}/dashboard/bookings`,
      },
    });

    // In-App Notification to Client
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "BOOKING",
          title: "🎉 Service Order Placed!",
          message: `Your order for "${input.serviceTitle}" has been placed ($${(input.priceInCents / 100).toFixed(0)} USD). Our executive team will review your requirements.`,
          payload: { actionUrl: "/dashboard/bookings" },
        },
      });

      // In-App Notification to Admins
      const admins = await prisma.user.findMany({
        where: { role: Role.ADMIN, isDeleted: false },
        select: { id: true },
      });

      for (const admin of admins) {
        await prisma.notification.create({
          data: {
            userId: admin.id,
            type: "BOOKING",
            title: `💼 New Service Order: ${input.serviceTitle}`,
            message: `${user.name} ordered "${input.serviceTitle}" ($${(input.priceInCents / 100).toFixed(0)} USD). Check admin dashboard for client details.`,
            payload: { actionUrl: "/admin/bookings" },
          },
        });
      }
    } catch (notifErr: any) {
      console.warn("Failed to dispatch service order notifications:", notifErr.message);
    }

    return { checkoutUrl, booking };
  }
}
