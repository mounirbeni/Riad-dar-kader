import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5 text-center">
      <p className="font-serif text-3xl text-terracotta">{value}</p>
      <p className="text-xs font-semibold text-ink mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return <span className="inline-block rounded-lg bg-sand px-2 py-0.5 text-[11px] text-ink/70 border border-sand-200">{text}</span>;
}

export default async function SurveysPage() {
  const responses = await prisma.surveyResponse.findMany({
    orderBy: { createdAt: "desc" },
  });

  const total = responses.length;
  const wantDemo = responses.filter(r => r.wantsDemo).length;

  // Most wanted features
  const featureCount: Record<string, number> = {};
  responses.forEach(r => r.wantedFeatures.forEach(f => { featureCount[f] = (featureCount[f] ?? 0) + 1; }));
  const topFeatures = Object.entries(featureCount).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Willingness to pay
  const payCount: Record<string, number> = {};
  responses.forEach(r => { payCount[r.willingToPay] = (payCount[r.willingToPay] ?? 0) + 1; });
  const payBreakdown = Object.entries(payCount).sort((a, b) => b[1] - a[1]);

  // Cities
  const cityCount: Record<string, number> = {};
  responses.forEach(r => { cityCount[r.city] = (cityCount[r.city] ?? 0) + 1; });
  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink">Sondage</h1>
          <p className="mt-1 text-sm text-muted">Réponses des propriétaires de riads</p>
        </div>
        <a
          href="/sondage"
          target="_blank"
          className="flex items-center gap-2 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-2 text-sm font-semibold text-terracotta hover:bg-terracotta/10 transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Voir le sondage
        </a>
      </div>

      {total === 0 ? (
        <div className="rounded-2xl border border-sand-200 bg-white p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-sand/60">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
              <rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/>
            </svg>
          </div>
          <p className="font-serif text-lg text-ink">Aucune réponse encore</p>
          <p className="text-sm text-muted mt-1">Partagez le lien du sondage avec des propriétaires de riads</p>
          <div className="mt-4 rounded-xl bg-sand border border-sand-200 px-4 py-3 font-mono text-sm text-ink/60 text-left max-w-sm mx-auto">
            riadkader.vercel.app/sondage
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Réponses totales" value={String(total)} />
            <StatCard label="Demandes de démo" value={String(wantDemo)} sub={total > 0 ? `${Math.round(wantDemo / total * 100)}%` : ""} />
            <StatCard label="Taux de complétion" value="100%" sub="Formulaire complet requis" />
            <StatCard label="Villes représentées" value={String(Object.keys(cityCount).length)} />
          </div>

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Top features */}
            <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
              <h2 className="font-medium text-ink text-sm mb-4">Fonctionnalités les plus demandées</h2>
              <div className="space-y-3">
                {topFeatures.map(([feat, count]) => (
                  <div key={feat}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-ink/80 truncate pr-2">{feat}</span>
                      <span className="text-xs font-semibold text-terracotta shrink-0">{count}/{total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sand-200 overflow-hidden">
                      <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${Math.round(count / total * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget breakdown */}
            <div className="rounded-2xl bg-white border border-sand-200 shadow-sm p-5">
              <h2 className="font-medium text-ink text-sm mb-4">Budget mensuel accepté</h2>
              <div className="space-y-3">
                {payBreakdown.map(([pay, count]) => (
                  <div key={pay}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-ink/80 truncate pr-2">{pay}</span>
                      <span className="text-xs font-semibold text-terracotta shrink-0">{count} ({Math.round(count / total * 100)}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-sand-200 overflow-hidden">
                      <div className="h-full rounded-full bg-brass/70 transition-all" style={{ width: `${Math.round(count / total * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Share link */}
          <div className="rounded-2xl bg-terracotta/5 border border-terracotta/20 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-xs font-semibold text-terracotta uppercase tracking-wide mb-0.5">Lien à partager</p>
                <p className="font-mono text-sm text-ink">riadkader.vercel.app/s</p>
              </div>
              <a href="/sondage" target="_blank" className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta/90 transition-colors">Ouvrir</a>
            </div>

            {/* WhatsApp message template */}
            <div className="rounded-xl bg-white border border-sand-200 p-4">
              <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-2">Message WhatsApp à envoyer</p>
              <p className="text-sm text-ink/80 whitespace-pre-line leading-relaxed">
                {`Bonjour 👋

Je développe une plateforme de gestion conçue spécialement pour les riads — réservations, messagerie, planning et plus encore.

Avant le lancement, j'aimerais comprendre vos besoins réels. Pouvez-vous répondre à ce court sondage (5 min) ?

👉 riadkader.vercel.app/s

Vos retours sont très précieux. Merci ! 🙏`}
              </p>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Bonjour 👋\n\nJe développe une plateforme de gestion conçue spécialement pour les riads — réservations, messagerie, planning et plus encore.\n\nAvant le lancement, j'aimerais comprendre vos besoins réels. Pouvez-vous répondre à ce court sondage (5 min) ?\n\n👉 riadkader.vercel.app/s\n\nVos retours sont très précieux. Merci ! 🙏`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Envoyer via WhatsApp
              </a>
            </div>
          </div>

          {/* Individual responses */}
          <div>
            <h2 className="font-serif text-lg text-ink mb-4">Réponses individuelles ({total})</h2>
            <div className="space-y-3">
              {responses.map((r, idx) => (
                <details key={r.id} className="rounded-2xl border border-sand-200 bg-white shadow-sm overflow-hidden group">
                  <summary className="flex items-center gap-4 px-5 py-4 cursor-pointer list-none hover:bg-sand/30 transition-colors">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta/10 font-semibold text-sm text-terracotta">
                      {total - idx}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink truncate">{r.riadName}</p>
                      <p className="text-xs text-muted">{r.city} · {r.roomCount} · {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {r.wantsDemo && <span className="rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2.5 py-1">Démo</span>}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted group-open:rotate-180 transition-transform"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </summary>

                  <div className="px-5 pb-5 pt-2 border-t border-sand-100 space-y-5">
                    {/* Row 1 */}
                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Activité</p>
                        <p className="text-ink">{r.yearsOpen}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Site web</p>
                        <p className="text-ink">{r.hasWebsite}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Réservations directes</p>
                        <p className="text-ink">{r.directPct}</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-2">Plateformes utilisées</p>
                        <div className="flex flex-wrap gap-1">{r.platforms.map(p => <Badge key={p} text={p} />)}</div>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-2">Méthodes de gestion</p>
                        <div className="flex flex-wrap gap-1">{r.bookingMethods.map(m => <Badge key={m} text={m} />)}</div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Temps admin/jour</p>
                        <p className="text-ink">{r.adminTimeDay}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Réservations perdues</p>
                        <p className="text-ink">{r.lostBookings}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Principal stress</p>
                        <p className="text-ink">{r.biggestStress}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-2">Fonctionnalités souhaitées</p>
                      <div className="flex flex-wrap gap-1">{r.wantedFeatures.map(f => <Badge key={f} text={f} />)}</div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Budget mensuel</p>
                        <p className="font-semibold text-terracotta">{r.willingToPay}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Mode de paiement</p>
                        <p className="text-ink">{r.payPreference}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Commission OK ?</p>
                        <p className="text-ink">{r.commissionOk}</p>
                      </div>
                    </div>

                    {r.wantsDemo && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                        <p className="text-xs font-semibold text-emerald-700 mb-1">Demande de démo ✓</p>
                        {r.contactName && <p className="text-sm text-ink">{r.contactName}</p>}
                        {r.contactWa && (
                          <a href={`https://wa.me/${r.contactWa.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-1 text-sm text-emerald-700 font-medium hover:underline">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91A16 16 0 0016 17.91l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 18.92z"/></svg>
                            {r.contactWa}
                          </a>
                        )}
                      </div>
                    )}

                    {r.comments && (
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-muted tracking-wide mb-1">Commentaires</p>
                        <p className="text-sm text-ink/80 italic">"{r.comments}"</p>
                      </div>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
