"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  authenticate,
  createSession,
  destroySession,
  requireSession,
} from "@/lib/auth";
import {
  adminLoginSchema,
  blockDateSchema,
  extraSchema,
  roomSchema,
  updateBookingStatusSchema,
} from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";
import { eachNight, parseDateOnly } from "@/lib/dates";
import { sendEmail } from "@/lib/email/send";
import {
  bookingCancelled,
  bookingConfirmed,
  preArrival,
  type EmailBookingData,
} from "@/lib/email/templates";
import { SETTING_KEYS } from "@/lib/constants";

type ActionState = { ok: boolean; error?: string; message?: string };

// --- Auth ---

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] || "unknown").trim();
  const limited = rateLimit(`login:${ip}`, 8, 10 * 60_000);
  if (!limited.success) {
    return { ok: false, error: "Trop de tentatives. Réessayez plus tard." };
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Identifiants invalides." };
  }

  const session = await authenticate(parsed.data.email, parsed.data.password);
  if (!session) {
    return { ok: false, error: "Email ou mot de passe incorrect." };
  }

  await createSession(session);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

// --- Bookings ---

function toEmailData(booking: {
  reference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry: string | null;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  optionLabel: string | null;
  estimatedTotal: number;
  specialRequests: string | null;
  extras: { nameSnapshot: string; quantity: number }[];
}): EmailBookingData {
  return {
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
}

export async function updateBookingStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const parsed = updateBookingStatusSchema.safeParse({
    bookingId: formData.get("bookingId"),
    status: formData.get("status"),
    adminNotes: formData.get("adminNotes"),
  });
  if (!parsed.success) return { ok: false, error: "Données invalides." };

  const { bookingId, status, adminNotes } = parsed.data;

  // Fetch current status before update to record history.
  const before = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status, adminNotes: adminNotes || null },
    include: { extras: true },
  });

  // Record status change in history.
  if (before && before.status !== status) {
    await prisma.bookingStatusHistory.create({
      data: { bookingId, fromStatus: before.status, toStatus: status },
    });
  }

  // Guest-facing email on confirm / cancel.
  if (status === "confirmed") {
    await sendEmail({
      to: booking.guestEmail,
      email: bookingConfirmed(toEmailData(booking)),
      bookingId,
      template: "bookingConfirmed",
    });
    // Auto-send welcome chat message on first confirmation
    const alreadyWelcomed = await prisma.bookingMessage.count({ where: { bookingId, sender: "admin" } });
    if (alreadyWelcomed === 0) {
      const checkInLabel = booking.checkIn.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
      await prisma.bookingMessage.create({
        data: {
          bookingId,
          sender: "admin",
          senderName: "Riad Dar Kader",
          content: `Bonjour ${booking.guestName.split(" ")[0]},\n\nVotre réservation ${booking.reference} est confirmée — nous avons hâte de vous accueillir le ${checkInLabel} !\n\nN'hésitez pas à nous écrire ici pour toute question avant votre arrivée.\n\nÀ très bientôt,\nL'équipe Riad Dar Kader`,
        },
      });
    }
  } else if (status === "cancelled") {
    await sendEmail({
      to: booking.guestEmail,
      email: bookingCancelled(toEmailData(booking)),
      bookingId,
      template: "bookingCancelled",
    });
  }

  revalidatePath("/admin/bookings");
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/calendar");
  return { ok: true, message: "Réservation mise à jour." };
}

export async function checkInGuestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();
  const bookingId = String(formData.get("bookingId") || "");
  if (!bookingId) return { ok: false, error: "ID manquant." };
  await prisma.booking.update({ where: { id: bookingId }, data: { checkedIn: true, status: "confirmed" } });
  revalidatePath("/admin/calendar");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: "Client enregistré." };
}

export async function checkOutGuestAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireSession();
  const bookingId = String(formData.get("bookingId") || "");
  if (!bookingId) return { ok: false, error: "ID manquant." };
  await prisma.booking.update({ where: { id: bookingId }, data: { checkedIn: false, status: "completed" } });
  revalidatePath("/admin/calendar");
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { ok: true, message: "Check-out enregistré." };
}

export async function sendPreArrivalAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const bookingId = String(formData.get("bookingId") || "");
  if (!bookingId) return { ok: false, error: "Réservation introuvable." };
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { extras: true },
  });
  if (!booking) return { ok: false, error: "Réservation introuvable." };
  await sendEmail({
    to: booking.guestEmail,
    email: preArrival(toEmailData(booking)),
  });
  return { ok: true, message: "Message pré-arrivée envoyé." };
}

// --- Rooms ---

export async function saveRoomAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  const parsed = roomSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    capacity: formData.get("capacity"),
    basePrice: formData.get("basePrice"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }
  try {
    if (id) {
      await prisma.room.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.room.create({ data: parsed.data });
    }
  } catch {
    return { ok: false, error: "Ce slug est déjà utilisé." };
  }
  revalidatePath("/admin/rooms");
  return { ok: true, message: "Chambre enregistrée." };
}

export async function deleteRoomAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  if (id) await prisma.room.delete({ where: { id } });
  revalidatePath("/admin/rooms");
  return { ok: true, message: "Chambre supprimée." };
}

// --- Extras ---

export async function saveExtraAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  const parsed = extraSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    nameFr: formData.get("nameFr"),
    description: formData.get("description"),
    descriptionFr: formData.get("descriptionFr"),
    price: formData.get("price"),
    priceType: formData.get("priceType"),
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Données invalides." };
  }
  try {
    if (id) {
      await prisma.extra.update({ where: { id }, data: parsed.data });
    } else {
      await prisma.extra.create({ data: parsed.data });
    }
  } catch {
    return { ok: false, error: "Ce slug est déjà utilisé." };
  }
  revalidatePath("/admin/extras");
  return { ok: true, message: "Extra enregistré." };
}

export async function toggleExtraAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  const extra = await prisma.extra.findUnique({ where: { id } });
  if (extra) {
    await prisma.extra.update({
      where: { id },
      data: { isActive: !extra.isActive },
    });
  }
  revalidatePath("/admin/extras");
  return { ok: true };
}

// --- Blocked dates ---

export async function blockDatesAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const parsed = blockDateSchema.safeParse({
    from: formData.get("from"),
    to: formData.get("to"),
    roomId: formData.get("roomId"),
    reason: formData.get("reason"),
  });
  if (!parsed.success) return { ok: false, error: "Dates invalides." };

  const from = parseDateOnly(parsed.data.from);
  const to = parseDateOnly(parsed.data.to);
  if (!from || !to || to < from) {
    return { ok: false, error: "Plage de dates invalide." };
  }
  // Inclusive end date for blocking.
  const end = new Date(to);
  end.setUTCDate(end.getUTCDate() + 1);
  const nights = eachNight(from, end);
  const roomId = parsed.data.roomId || null;

  // Postgres treats NULL as distinct in unique constraints, so we can't rely on
  // upsert for whole-riad blocks. Clear any existing rows for these dates first.
  await prisma.blockedDate.deleteMany({
    where: { roomId, date: { in: nights } },
  });
  await prisma.blockedDate.createMany({
    data: nights.map((date) => ({
      roomId,
      date,
      reason: parsed.data.reason || null,
    })),
    skipDuplicates: true,
  });
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true, message: `${nights.length} date(s) bloquée(s).` };
}

export async function unblockDateAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const id = String(formData.get("id") || "");
  if (id) await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  return { ok: true };
}

// --- Data management ---

export async function clearAllDataAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const confirm = String(formData.get("confirm") || "");
  if (confirm !== "EFFACER") {
    return { ok: false, error: "Confirmation incorrecte. Tapez exactement : EFFACER" };
  }
  await prisma.bookingExtra.deleteMany();
  await prisma.bookingRoom.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  // Clear transactional inbox + tasks — rooms/extras/settings/admin kept
  try { await prisma.contactMessage.deleteMany(); } catch { /* table may not exist yet */ }
  try { await prisma.housekeepingTask.deleteMany(); } catch { /* table may not exist yet */ }
  revalidatePath("/admin");
  revalidatePath("/admin/bookings");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/guests");
  return { ok: true, message: "Toutes les réservations et dates bloquées ont été supprimées." };
}

// --- Settings ---

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireSession();
  const hold = formData.get("hold_pending_availability") === "on" ? "true" : "false";
  const minNights = String(formData.get("min_nights") || "1");

  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEYS.HOLD_PENDING_AVAILABILITY },
    update: { value: hold },
    create: { key: SETTING_KEYS.HOLD_PENDING_AVAILABILITY, value: hold },
  });
  await prisma.siteSetting.upsert({
    where: { key: SETTING_KEYS.MIN_NIGHTS },
    update: { value: minNights },
    create: { key: SETTING_KEYS.MIN_NIGHTS, value: minNights },
  });

  revalidatePath("/admin/settings");
  return { ok: true, message: "Paramètres enregistrés." };
}
