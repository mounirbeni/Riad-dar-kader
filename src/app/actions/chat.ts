"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getGuestSession } from "@/lib/guest-auth";
import { requireSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function sendGuestMessageAction(formData: FormData): Promise<void> {
  const session = await getGuestSession();
  if (!session) return;
  const bookingId = String(formData.get("bookingId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!bookingId || !content) return;
  if (content.length > 2000) return;

  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const limited = rateLimit(`chat:${ip}:${bookingId}`, 20, 60_000); // 20 messages per minute per booking
  if (!limited.success) return;

  // Verify booking belongs to this guest
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, guestEmail: session.email },
  });
  if (!booking) return;

  await prisma.bookingMessage.create({
    data: { bookingId, sender: "guest", senderName: session.name, content },
  });
  revalidatePath(`/compte/reservations/${bookingId}`, "page");
}

export async function sendAdminMessageAction(_prev: undefined, formData: FormData): Promise<undefined> {
  await requireSession();
  const bookingId = String(formData.get("bookingId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!bookingId || !content) return undefined;
  if (content.length > 5000) return undefined;
  const bookingExists = await prisma.booking.findUnique({ where: { id: bookingId }, select: { id: true } });
  if (!bookingExists) return undefined;

  await prisma.bookingMessage.create({
    data: { bookingId, sender: "admin", senderName: "Riad Dar Kader", content },
  });
  revalidatePath(`/admin/bookings/${bookingId}`);
  return undefined;
}

export async function markAdminMessagesReadAction(bookingId: string): Promise<void> {
  await requireSession();
  await prisma.bookingMessage.updateMany({
    where: { bookingId, sender: "guest", isRead: false },
    data: { isRead: true },
  });
  revalidatePath(`/admin/bookings/${bookingId}`);
}
