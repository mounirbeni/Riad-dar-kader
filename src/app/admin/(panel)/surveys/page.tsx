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
          href="/fr/sondage"
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
            riadkader.vercel.app/fr/sondage
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
          <div className="rounded-2xl bg-terracotta/5 border border-terracotta/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1">
              <p className="text-xs font-semibold text-terracotta uppercase tracking-wide mb-0.5">Lien à partager</p>
              <p className="font-mono text-sm text-ink">riadkader.vercel.app/fr/sondage</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href="/fr/sondage" target="_blank" className="rounded-xl bg-terracotta px-4 py-2 text-xs font-semibold text-white hover:bg-terracotta/90 transition-colors">FR</a>
              <a href="/en/sondage" target="_blank" className="rounded-xl border border-terracotta/30 bg-white px-4 py-2 text-xs font-semibold text-terracotta hover:bg-terracotta/5 transition-colors">EN</a>
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
