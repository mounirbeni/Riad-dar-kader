import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Administration — Riad Dar Kader",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const pendingCount = await prisma.booking.count({ where: { status: "pending" } });

  return (
    <AdminShell email={session.email} pendingCount={pendingCount}>
      {children}
    </AdminShell>
  );
}
