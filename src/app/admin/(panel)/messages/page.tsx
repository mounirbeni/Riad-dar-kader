import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MessagesUI } from "@/components/admin/MessagesUI";

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

async function deleteMessageAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  if (id) await prisma.contactMessage.delete({ where: { id } });
  revalidatePath("/admin/messages");
}

export default async function MessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const newCount = messages.filter((m) => m.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Messages</h1>
        <p className="mt-1 text-sm text-muted">
          {newCount > 0 ? (
            <span className="text-terracotta font-medium">{newCount} nouveau{newCount > 1 ? "x" : ""} message{newCount > 1 ? "s" : ""}</span>
          ) : messages.length === 0 ? (
            "Aucun message pour l'instant"
          ) : (
            "Tous les messages sont lus"
          )}
          {messages.length > 0 && ` · ${messages.length} au total`}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="rounded-2xl bg-white border border-sand-200 p-16 text-center">
          <p className="text-3xl mb-3">✉️</p>
          <p className="font-medium text-ink mb-1">Boîte de réception vide</p>
          <p className="text-sm text-muted">Les messages envoyés via le formulaire de contact apparaîtront ici.</p>
        </div>
      ) : (
        <MessagesUI
          messages={messages}
          markReadAction={markReadAction}
          replyAction={replyAction}
          deleteAction={deleteMessageAction}
        />
      )}
    </div>
  );
}
