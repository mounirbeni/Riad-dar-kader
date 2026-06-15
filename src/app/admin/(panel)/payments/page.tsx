import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: { rooms: { include: { room: true } } },
  });

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "completed");
  const pending = bookings.filter((b) => b.status === "pending");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  const totalConfirmed = confirmed.reduce((s, b) => s + b.estimatedTotal, 0);
  const totalPending = pending.reduce((s, b) => s + b.estimatedTotal, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-ink">Paiements</h1>
        <p className="mt-1 text-sm text-muted">Suivi des montants par réservation</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total confirmé" amount={totalConfirmed} count={confirmed.length} color="green" />
        <SummaryCard label="En attente de confirmation" amount={totalPending} count={pending.length} color="amber" />
        <SummaryCard label="Annulations" amount={cancelled.reduce((s, b) => s + b.estimatedTotal, 0)} count={cancelled.length} color="red" />
      </div>

      {/* Full table */}
      <div className="rounded-2xl bg-white border border-sand-200 overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-sand-200 flex items-center justify-between">
          <h2 className="font-semibold text-ink">Toutes les réservations</h2>
          <span className="text-xs text-muted">{bookings.length} réservations</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-200 bg-sand/60">
                {["Référence", "Client", "Chambre(s)", "Arrivée", "Nuits", "Total", "Statut", ""].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => (
                <tr key={b.id} className={`border-b border-sand-200/50 hover:bg-sand/30 transition-colors ${i % 2 !== 0 ? "bg-sand/10" : ""}`}>
                  <td className="px-4 py-3.5 font-mono text-xs text-terracotta font-semibold">{b.reference}</td>
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-ink">{b.guestName}</p>
                    <p className="text-xs text-muted">{b.guestEmail}</p>
                  </td>
                  <td className="px-4 py-3.5 text-muted text-xs max-w-[160px] truncate">
                    {b.rooms.map((r) => r.room.name).join(", ") || "—"}
                  </td>
                  <td className="px-4 py-3.5 text-muted whitespace-nowrap">
                    {new Date(b.checkIn).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3.5 text-center text-muted">
                    {Math.round((new Date(b.checkOut).getTime() - new Date(b.checkIn).getTime()) / 86400000)}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-ink whitespace-nowrap">
                    {b.estimatedTotal.toLocaleString("fr-FR")} MAD
                  </td>
                  <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3.5">
                    <Link href={`/admin/bookings/${b.id}`} className="text-xs text-terracotta hover:underline whitespace-nowrap">Détails →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-sand-200 flex items-center justify-between text-xs text-muted">
          <span>{bookings.length} réservations</span>
          <span className="font-medium text-ink">
            Total confirmé : {totalConfirmed.toLocaleString("fr-FR")} MAD
          </span>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, amount, count, color }: { label: string; amount: number; count: number; color: "green" | "amber" | "red" }) {
  const styles = {
    green: "bg-green-50 border-green-200",
    amber: "bg-amber-50 border-amber-200",
    red: "bg-red-50 border-red-200",
  };
  const textStyles = {
    green: "text-green-700",
    amber: "text-amber-700",
    red: "text-red-600",
  };
  return (
    <div className={`rounded-2xl border p-5 ${styles[color]}`}>
      <p className={`text-xs font-medium mb-1 ${textStyles[color]}`}>{label}</p>
      <p className={`text-2xl font-bold ${textStyles[color]}`}>{amount.toLocaleString("fr-FR")} <span className="text-base font-normal">MAD</span></p>
      <p className={`text-xs mt-1 ${textStyles[color]} opacity-70`}>{count} réservation{count !== 1 ? "s" : ""}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-red-100 text-red-600",
    completed: "bg-blue-100 text-blue-700",
  };
  const labels: Record<string, string> = { confirmed: "Confirmé", pending: "En attente", cancelled: "Annulé", completed: "Terminé" };
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${map[status] ?? "bg-sand text-muted"}`}>{labels[status] ?? status}</span>;
}
