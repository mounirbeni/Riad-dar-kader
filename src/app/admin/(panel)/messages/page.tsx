import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { UnifiedInbox } from "@/components/admin/UnifiedInbox";

export const dynamic = "force-dynamic";

async function markReadAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.contactMessage.update({ where: { id }, data: { status: "read" } });
  revalidatePath("/admin/messages");
}

async function replyAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  const reply = String(formData.get("reply") || "").trim();
  if (!id || !reply) return;
  await prisma.contactMessage.update({ where: { id }, data: { reply, status: "replied" } });
  revalidatePath("/admin/messages");
}

async function deleteContactAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export default async function MessagesPage() {
  // Booking conversations — bookings that have at least one message
  const bookingThreads = await prisma.booking.findMany({
    where: { messages: { some: {} } },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      rooms: { include: { room: true }, take: 1 },
      _count: {
        select: {
          messages: { where: { sender: "guest", isRead: false } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Contact form messages
  const contactMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalUnread =
    bookingThreads.reduce((s, b) => s + b._count.messages, 0) +
    contactMessages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Messages</h1>
          <p className="mt-1 text-sm text-muted">
            {totalUnread > 0 ? (
              <span className="text-terracotta font-medium">
                {totalUnread} non lu{totalUnread > 1 ? "s" : ""}
              </span>
            ) : (
              "Tout est lu"
            )}
            {" · "}
            {bookingThreads.length} conversation{bookingThreads.length !== 1 ? "s" : ""} client
            {contactMessages.length > 0 && ` · ${contactMessages.length} formulaire${contactMessages.length > 1 ? "s" : ""}`}
          </p>
        </div>
        <Link
          href="/admin/bookings"
          className="text-xs text-muted hover:text-terracotta transition-colors shrink-0 mt-1"
        >
          Voir toutes les réservations →
        </Link>
      </div>

      <UnifiedInbox
        bookingThreads={bookingThreads.map((b) => ({
          id: b.id,
          reference: b.reference,
          guestName: b.guestName,
          guestEmail: b.guestEmail,
          roomName: b.rooms[0]?.room.name ?? "—",
          latestMessage: b.messages[0]
            ? {
                content: b.messages[0].content,
                sender: b.messages[0].sender,
                createdAt: b.messages[0].createdAt,
              }
            : null,
          unreadCount: b._count.messages,
        }))}
        contactMessages={contactMessages}
        markReadAction={markReadAction}
        replyAction={replyAction}
        deleteAction={deleteContactAction}
      />
    </div>
  );
}
