"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getGuestSession } from "@/lib/guest-auth";
import { requireSession } from "@/lib/auth";

export async function sendGuestMessageAction(formData: FormData): Promise<void> {
  const session = await getGuestSession();
  if (!session) return;
  const bookingId = String(formData.get("bookingId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!bookingId || !content) return;

  // Verify booking belongs to this guest
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, guestEmail: session.email },
  });
  if (!booking) return;

  await prisma.bookingMessage.create({
    data: { bookingId, sender: "guest", senderName: session.name, content },
  });
  revalidatePath(`/fr/compte/reservations/${bookingId}`);
  revalidatePath(`/en/compte/reservations/${bookingId}`);
}

export async function sendAdminMessageAction(_prev: undefined, formData: FormData): Promise<undefined> {
  await requireSession();
  const bookingId = String(formData.get("bookingId") || "");
  const content = String(formData.get("content") || "").trim();
  if (!bookingId || !content) return undefined;

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
