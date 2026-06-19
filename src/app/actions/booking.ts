"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkAvailability, getDailyAvailability } from "@/lib/availability";
import { availabilitySchema, createBookingSchema } from "@/lib/validation";
import { rateLimit, sweep } from "@/lib/rate-limit";
import { generateReference } from "@/lib/reference";
import { parseDateOnly, nightsBetween } from "@/lib/dates";
import { extraLineTotal } from "@/lib/pricing";
import { sendEmail } from "@/lib/email/send";
import {
  guestRequestReceived,
  ownerNewBooking,
  type EmailBookingData,
} from "@/lib/email/templates";
import type { AvailabilityResult, DayAvailability } from "@/lib/availability";

async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") || "unknown";
}

export type AvailabilityActionResult =
  | { ok: true; result: AvailabilityResult }
  | { ok: false; error: string };

/** Calendar availability for the date-range picker (Step 1). */
export async function calendarAvailability(
  fromStr: string,
  days = 75
): Promise<DayAvailability[]> {
  sweep();
  const ip = await clientIp();
  const limited = rateLimit(`calendar:${ip}`, 60, 60_000);
  if (!limited.success) return [];
  return getDailyAvailability(fromStr, Math.min(days, 180));
}

/** Public availability search (Step 2 of booking flow). */
export async function searchAvailability(input: {
  checkIn: string;
  checkOut: string;
  guests: number;
}): Promise<AvailabilityActionResult> {
  const parsed = availabilitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "invalid_dates" };
  }

  sweep();
  const ip = await clientIp();
  const limited = rateLimit(`availability:${ip}`, 30, 60_000);
  if (!limited.success) {
    return { ok: false, error: "rate_limited" };
  }

  const result = await checkAvailability(parsed.data);
  return { ok: true, result };
}

export type CreateBookingResult =
  | {
      ok: true;
      reference: string;
      estimatedTotal: number;
      whatsappOwnerUrl: string;
    }
  | { ok: false; error: string };

/** Submit a reservation request (Step 5). Server-side validated end to end. */
export async function createBooking(
  raw: unknown
): Promise<CreateBookingResult> {
  const parsed = createBookingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "invalid_input" };
  }
  const data = parsed.data;

  // Honeypot — silently reject bots.
  if (data.website && data.website.length > 0) {
    return { ok: false, error: "invalid_input" };
  }

  sweep();
  const ip = await clientIp();
  const limited = rateLimit(`booking:${ip}`, 5, 10 * 60_000);
  if (!limited.success) {
    return { ok: false, error: "rate_limited" };
  }

  // Re-validate availability server-side — never trust the client total.
  const availability = await checkAvailability({
    checkIn: data.checkIn,
    checkOut: data.checkOut,
    guests: data.guests,
  });

  if (!availability.isAvailable) {
    return { ok: false, error: availability.reason || "no_capacity" };
  }

  // Resolve the rooms the guest selected against what is actually free.
  const selectedRooms = availability.availableRoomsDetail.filter((r) =>
    data.roomIds.includes(r.id)
  );
  if (selectedRooms.length !== data.roomIds.length) {
    // One or more chosen rooms are no longer available.
    return { ok: false, error: "no_capacity" };
  }
  const selectedCapacity = selectedRooms.reduce((s, r) => s + r.capacity, 0);
  if (selectedCapacity < data.guests) {
    return { ok: false, error: "no_capacity" };
  }

  const checkIn = parseDateOnly(data.checkIn)!;
  const checkOut = parseDateOnly(data.checkOut)!;
  const nights = nightsBetween(checkIn, checkOut);

  const roomsTotal = selectedRooms.reduce(
    (s, r) => s + r.basePrice * nights,
    0
  );
  const optionLabel = selectedRooms.map((r) => r.name).join(" + ");

  // Resolve and price extras from the database (don't trust client prices).
  const requestedExtraIds = data.extras.map((e) => e.extraId);
  const dbExtras = requestedExtraIds.length
    ? await prisma.extra.findMany({
        where: { id: { in: requestedExtraIds }, isActive: true },
      })
    : [];

  let extrasTotal = 0;
  const bookingExtrasData = data.extras
    .map((req) => {
      const extra = dbExtras.find((e) => e.id === req.extraId);
      if (!extra) return null;
      const line = extraLineTotal(extra.price, extra.priceType, req.quantity, {
        guests: data.guests,
        nights,
      });
      extrasTotal += line;
      return {
        extraId: extra.id,
        quantity: req.quantity,
        priceSnapshot: extra.price,
        nameSnapshot: extra.name,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const estimatedTotal = roomsTotal + extrasTotal;
  const reference = await uniqueReference();

  const booking = await prisma.booking.create({
    data: {
      reference,
      checkIn,
      checkOut,
      guests: data.guests,
      guestName: data.guestName,
      guestEmail: data.guestEmail.toLowerCase(),
      guestPhone: data.guestPhone,
      guestCountry: data.guestCountry || null,
      specialRequests: data.specialRequests || null,
      status: "pending",
      optionLabel,
      estimatedTotal,
      guestUserId: null,
      rooms: {
        create: selectedRooms.map((r) => ({ roomId: r.id })),
      },
      extras: {
        create: bookingExtrasData,
      },
    },
    include: { extras: true },
  });

  // Fire-and-forget notifications (never block the response on email).
  const emailData: EmailBookingData = {
    reference: booking.reference,
    guestName: booking.guestName,
    guestEmail: booking.guestEmail,
    guestPhone: booking.guestPhone,
    guestCountry: booking.guestCountry,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    optionLabel: booking.optionLabel,
    estimatedTotal: booking.estimatedTotal,
    specialRequests: booking.specialRequests,
    extras: booking.extras.map((e) => ({
      name: e.nameSnapshot,
      quantity: e.quantity,
    })),
  };

  const ownerEmail =
    process.env.OWNER_NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "reservations@mbndemo.com";

  // Build owner WhatsApp deep link for the confirmation screen.
  const { ownerWhatsAppLink } = await import("@/lib/whatsapp");
  const whatsappOwnerUrl = ownerWhatsAppLink({
    reference: booking.reference,
    guestName: booking.guestName,
    guestPhone: booking.guestPhone,
    guestCountry: booking.guestCountry,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    optionLabel: booking.optionLabel,
    status: booking.status,
    estimatedTotal: booking.estimatedTotal,
    extras: emailData.extras,
  });

  await Promise.allSettled([
    sendEmail({
      to: booking.guestEmail,
      email: guestRequestReceived(emailData),
    }),
    sendEmail({
      to: ownerEmail,
      email: ownerNewBooking(emailData),
      replyTo: booking.guestEmail,
    }),
  ]);

  return {
    ok: true,
    reference: booking.reference,
    estimatedTotal: booking.estimatedTotal,
    whatsappOwnerUrl,
  };
}

async function uniqueReference(): Promise<string> {
  for (let i = 0; i < 6; i++) {
    const candidate = generateReference();
    const existing = await prisma.booking.findUnique({
      where: { reference: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  return `DK-${Date.now().toString(36).toUpperCase().slice(-5)}`;
}
