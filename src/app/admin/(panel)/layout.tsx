import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Administration — Mbn Demo Riad",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [pendingCount, unreadMessages] = await Promise.all([
    prisma.booking.count({ where: { status: "pending" } }),
    Promise.all([
      prisma.bookingMessage.count({ where: { sender: "guest", isRead: false } }),
      prisma.contactMessage.count({ where: { status: "new" } }),
    ]).then(([a, b]) => a + b),
  ]);

  return (
    <AdminShell email={session.email} pendingCount={pendingCount} unreadMessages={unreadMessages}>
      {children}
    </AdminShell>
  );
}
