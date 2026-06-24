import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const TOOL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  phone: "Téléphone",
  excel: "Excel / Cahier",
  booking: "Booking.com",
  airbnb: "Airbnb",
  other: "Autre",
};

const INTEREST_LABELS: Record<string, { label: string; cls: string }> = {
  yes:   { label: "Intéressé",   cls: "bg-green-100 text-green-700" },
  maybe: { label: "Peut-être",   cls: "bg-amber-100 text-amber-700" },
  no:    { label: "Non",         cls: "bg-red-100 text-red-600" },
};

export default async function SondageAdminPage() {
  const responses = await prisma.surveyResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  const interested = responses.filter((r) => r.interest === "yes").length;
  const withWebsite = responses.filter((r) => r.hasWebsite).length;
  const withBooking = responses.filter((r) => r.hasOnlineBooking).length;

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Sondage</h1>
          <p className="mt-0.5 text-sm text-muted">Réponses des propriétaires de riads</p>
        </div>
        <a
          href="/sondage"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-terracotta/30 bg-white px-4 py-2 text-sm font-medium text-terracotta shadow-sm transition hover:bg-terracotta/5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          Voir le sondage
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Réponses totales", value: total, color: "text-ink" },
          { label: "Intéressés", value: interested, color: "text-green-700" },
          { label: "Ont un site web", value: withWebsite, color: "text-amber-700" },
          { label: "Réservation en ligne", value: withBooking, color: "text-sky-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
            <p className={`font-serif text-3xl font-semibold ${color}`}>{value}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Responses */}
      {total === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sand-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-muted" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h4" />
            </svg>
          </div>
          <p className="font-medium text-ink">Aucune réponse encore</p>
          <p className="mt-1 text-sm text-muted">Partagez le lien du sondage avec des propriétaires de riads</p>
          <p className="mt-3 rounded-xl bg-sand-100 px-4 py-2 font-mono text-xs text-muted">
            mbndemo.vercel.app/sondage
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {responses.map((r) => {
            const interest = INTEREST_LABELS[r.interest] ?? INTEREST_LABELS.maybe;
            return (
              <div key={r.id} className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{r.riadName}</p>
                    <p className="text-sm text-muted">{r.ownerName} · {r.city}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${interest.cls}`}>
                    {interest.label}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Téléphone</span>
                    <p className="mt-0.5 text-ink">{r.phone}</p>
                  </div>
                  {r.email && (
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Email</span>
                      <p className="mt-0.5 text-ink">{r.email}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Chambres</span>
                    <p className="mt-0.5 text-ink">{r.roomCount}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Site web</span>
                    <p className="mt-0.5 text-ink">{r.hasWebsite ? "Oui" : "Non"}</p>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Résas en ligne</span>
                    <p className="mt-0.5 text-ink">{r.hasOnlineBooking ? "Oui" : "Non"}</p>
                  </div>
                </div>

                {r.currentTools.length > 0 && (
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted/60">Outils actuels</span>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {r.currentTools.map((t) => (
                        <span key={t} className="rounded-lg bg-sand-100 px-2.5 py-1 text-xs text-muted">
                          {TOOL_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {r.notes && (
                  <p className="mt-4 rounded-xl bg-[#FDFAF7] px-4 py-3 text-sm text-muted italic">
                    {r.notes}
                  </p>
                )}

                <p className="mt-4 text-right text-[11px] text-muted/50">
                  {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric", month: "long", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
