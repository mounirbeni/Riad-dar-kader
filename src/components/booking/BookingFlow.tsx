"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { searchAvailability, createBooking } from "@/app/actions/booking";
import type { AvailabilityResult, StayOption } from "@/lib/availability";
import { formatMAD } from "@/lib/money";
import { extraLineTotal, priceTypeLabel } from "@/lib/pricing";
import {
  nightsBetween,
  parseDateOnly,
  formatDateHuman,
} from "@/lib/dates";
import { Stepper } from "./Stepper";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { IconCheck, IconBed, IconUser, IconMoon } from "@/components/Icons";

export type ClientExtra = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceType: "per_booking" | "per_guest" | "per_night";
};

type Confirmation = {
  reference: string;
  estimatedTotal: number;
  whatsappOwnerUrl: string;
};

export function BookingFlow({
  locale,
  dict,
  extras,
}: {
  locale: Locale;
  dict: Dictionary;
  extras: ClientExtra[];
}) {
  const t = dict.stay;
  const fr = locale === "fr";

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [optionKey, setOptionKey] = useState<StayOption["key"] | null>(null);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});

  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountry, setGuestCountry] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [website, setWebsite] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const nights = useMemo(() => {
    const a = parseDateOnly(checkIn);
    const b = parseDateOnly(checkOut);
    if (!a || !b || b <= a) return 0;
    return nightsBetween(a, b);
  }, [checkIn, checkOut]);

  const selectedOption = useMemo(
    () => availability?.suggestedOptions.find((o) => o.key === optionKey) || null,
    [availability, optionKey]
  );

  const extrasTotal = useMemo(
    () =>
      Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
        const e = extras.find((x) => x.id === id);
        if (!e || qty < 1) return sum;
        return sum + extraLineTotal(e.price, e.priceType, qty, { guests, nights });
      }, 0),
    [selectedExtras, extras, guests, nights]
  );

  const grandTotal = (selectedOption?.estimatedTotal || 0) + extrasTotal;
  const chosenExtras = extras.filter((e) => selectedExtras[e.id]);

  const errMsg = (code: string) =>
    (t.errors as Record<string, string>)[code] || t.errors.generic;

  async function onSearch() {
    if (!checkIn || !checkOut || nights < 1) {
      setError(errMsg("invalid_dates"));
      return;
    }
    setError(null);
    setLoading(true);
    setOptionKey(null);
    const res = await searchAvailability({ checkIn, checkOut, guests });
    setLoading(false);
    if (!res.ok) {
      setError(errMsg(res.error));
      setAvailability(null);
      return;
    }
    setAvailability(res.result);
    if (!res.result.isAvailable) setError(errMsg(res.result.reason || "no_capacity"));
    setStep(2);
  }

  function toggleExtra(id: string) {
    setSelectedExtras((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!optionKey) return;
    setError(null);
    setSubmitting(true);
    const res = await createBooking({
      checkIn, checkOut, guests, optionKey,
      guestName, guestEmail, guestPhone, guestCountry, specialRequests, website,
      extras: Object.entries(selectedExtras).map(([extraId, quantity]) => ({ extraId, quantity })),
    });
    setSubmitting(false);
    if (!res.ok) { setError(errMsg(res.error)); return; }
    setConfirmation({
      reference: res.reference,
      estimatedTotal: res.estimatedTotal,
      whatsappOwnerUrl: res.whatsappOwnerUrl,
    });
    setStep(5);
  }

  const optionLabel = (o: StayOption) => (fr ? o.labelFr : o.labelEn);
  const includedFeatures = fr
    ? ["Confirmation directe par le riad", "Sans paiement en ligne", "Annulation flexible"]
    : ["Confirmed directly by the riad", "No online payment", "Flexible cancellation"];

  // ---------- Confirmation ----------
  if (step === 5 && confirmation) {
    return (
      <div className="mt-10">
        <div className="card mx-auto max-w-xl overflow-hidden">
          <div className="bg-terracotta px-8 py-10 text-center text-white">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white">
              <IconCheck size={32} />
            </div>
            <h2 className="mt-4 font-serif text-3xl">{t.confirmTitle}</h2>
            <p className="mx-auto mt-2 max-w-sm text-white/85">{t.confirmText}</p>
          </div>
          <div className="p-8">
            <div className="rounded-xl border border-dashed border-brass/40 bg-sand p-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted">{t.confirmReference}</p>
              <p className="mt-1 font-serif text-2xl tracking-wide text-terracotta">{confirmation.reference}</p>
            </div>
            <Summary
              fr={fr} dict={dict} locale={locale}
              checkIn={checkIn} checkOut={checkOut} guests={guests} nights={nights}
              optionLabel={selectedOption ? optionLabel(selectedOption) : null}
              chosenExtras={chosenExtras} selectedExtras={selectedExtras}
              total={confirmation.estimatedTotal} flat
            />
            <a href={confirmation.whatsappOwnerUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp mt-6 w-full">
              {t.confirmWhatsapp}
            </a>
            <button type="button" onClick={() => window.location.reload()} className="btn-outline mt-3 w-full">
              {t.newSearch}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const showSummary = nights > 0 && step >= 2;

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
      <div className="card p-5 sm:p-7">
        <Stepper step={step} dict={dict} />

        <div key={step} className="mt-6 animate-step">
          {/* STEP 1 — Dates */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-sand-200 p-4 sm:p-5">
                <AvailabilityCalendar
                  locale={locale}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co); setError(null); }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-3">
                  <DatePill label={t.checkIn} value={checkIn ? formatDateHuman(parseDateOnly(checkIn)!, locale) : "—"} />
                  <DatePill label={t.checkOut} value={checkOut ? formatDateHuman(parseDateOnly(checkOut)!, locale) : "—"} />
                </div>
                <GuestStepper label={t.guests} value={guests} onChange={setGuests} />
              </div>

              {nights > 0 && (
                <p className="text-sm text-muted">
                  {nights} {nights > 1 ? dict.common.nights : dict.common.night}
                </p>
              )}
              {error && <p className="rounded-lg bg-terracotta/5 px-3 py-2 text-sm text-terracotta">{error}</p>}
              <button type="button" disabled={loading || nights < 1} onClick={onSearch} className="btn-primary w-full sm:w-auto">
                {loading ? t.searching : t.search}
              </button>
            </div>
          )}

          {/* STEP 2 — Options */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-serif text-2xl text-ink">{t.availableTitle}</h3>
              {availability && !availability.isAvailable && (
                <div className="rounded-xl bg-sand p-5 text-muted">{error || t.noAvailability}</div>
              )}
              {availability?.isAvailable && (
                <div className="space-y-4">
                  {availability.suggestedOptions.map((option) => {
                    const selected = optionKey === option.key;
                    return (
                      <button
                        type="button"
                        key={option.key}
                        onClick={() => setOptionKey(option.key)}
                        className={`block w-full rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-terracotta bg-terracotta/[0.04] ring-2 ring-terracotta/30"
                            : "border-sand-300 bg-white hover:border-brass hover:shadow-card"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-serif text-xl text-ink">{optionLabel(option)}</h4>
                              {option.key === "full_riad" && (
                                <span className="rounded-full bg-brass/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brass">
                                  {fr ? "Exclusif" : "Exclusive"}
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted">{fr ? option.descriptionFr : option.descriptionEn}</p>
                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                              <span className="flex items-center gap-1">
                                <IconBed size={13} />
                                {option.roomsRequired} {option.roomsRequired > 1 ? (fr ? "chambres" : "rooms") : (fr ? "chambre" : "room")}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconUser size={13} />
                                {fr ? "jusqu'à" : "up to"} {option.maxGuests} {dict.common.guests}
                              </span>
                              <span className="flex items-center gap-1">
                                <IconMoon size={13} />
                                {nights} {nights > 1 ? dict.common.nights : dict.common.night}
                              </span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="font-serif text-2xl text-terracotta">{formatMAD(option.pricePerNight, locale)}</p>
                            <p className="text-[11px] text-muted">/ {dict.common.night}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-sand-200 pt-3">
                          <span className="text-sm text-muted">
                            {dict.common.estimatedTotal}: <span className="font-semibold text-ink">{formatMAD(option.estimatedTotal, locale)}</span>
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${selected ? "bg-terracotta text-white" : "bg-sand-200 text-ink"}`}>
                            {selected && <IconCheck size={13} />}
                            {selected ? t.selected : t.selectOption}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                  <ul className="flex flex-wrap gap-x-5 gap-y-1 rounded-lg bg-sand px-4 py-3 text-xs text-muted">
                    {includedFeatures.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <IconCheck size={12} className="text-brass shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline">{t.back}</button>
                {availability?.isAvailable && (
                  <button type="button" disabled={!optionKey} onClick={() => setStep(3)} className="btn-primary">{t.continue}</button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3 — Extras */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-2xl text-ink">{t.extrasTitle}</h3>
                <p className="text-sm text-muted">{t.extrasSubtitle}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {extras.map((extra) => {
                  const active = !!selectedExtras[extra.id];
                  return (
                    <button
                      type="button"
                      key={extra.id}
                      onClick={() => toggleExtra(extra.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active ? "border-terracotta bg-terracotta/[0.04] ring-1 ring-terracotta/30" : "border-sand-300 bg-white hover:border-brass"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-ink">{extra.name}</span>
                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${active ? "bg-terracotta text-white" : "border border-sand-300 text-transparent"}`}>
                          {active && <IconCheck size={11} />}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{extra.description}</p>
                      <p className="mt-2 text-sm font-medium text-brass">
                        {extra.price > 0 ? formatMAD(extra.price, locale) : (fr ? "Inclus" : "Included")}
                        {extra.price > 0 && <span className="ml-1 text-[11px] font-normal text-muted">{priceTypeLabel(extra.priceType, locale)}</span>}
                      </p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-outline">{t.back}</button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary">{t.continue}</button>
              </div>
            </div>
          )}

          {/* STEP 4 — Details */}
          {step === 4 && (
            <form onSubmit={onSubmit} className="space-y-5">
              <h3 className="font-serif text-2xl text-ink">{t.detailsTitle}</h3>
              <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fullName} required value={guestName} onChange={setGuestName} />
                <Field label={t.email} type="email" required value={guestEmail} onChange={setGuestEmail} />
                <Field label={t.phone} required value={guestPhone} onChange={setGuestPhone} placeholder="+212…" />
                <Field label={t.country} value={guestCountry} onChange={setGuestCountry} />
              </div>
              <div>
                <label className="label">{t.specialRequests}</label>
                <textarea rows={3} value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} className="input" />
              </div>
              {error && <p className="rounded-lg bg-terracotta/5 px-3 py-2 text-sm text-terracotta">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-outline">{t.back}</button>
                <button type="submit" disabled={submitting} className="btn-primary">{submitting ? t.submitting : t.submit}</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Sticky summary */}
      {showSummary && (
        <aside className="lg:sticky lg:top-20">
          <Summary
            fr={fr} dict={dict} locale={locale}
            checkIn={checkIn} checkOut={checkOut} guests={guests} nights={nights}
            optionLabel={selectedOption ? optionLabel(selectedOption) : null}
            chosenExtras={chosenExtras} selectedExtras={selectedExtras} total={grandTotal}
          />
        </aside>
      )}
    </div>
  );
}

// ---------- Small pieces ----------

function DatePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sand-300 bg-white px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className="text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function GuestStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-1 rounded-xl border border-sand-300 bg-white p-1">
        <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-terracotta hover:bg-sand disabled:opacity-30" disabled={value <= 1}>−</button>
        <span className="w-8 text-center text-sm font-semibold">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(20, value + 1))} className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-terracotta hover:bg-sand disabled:opacity-30" disabled={value >= 20}>+</button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">{label}{required && <span className="text-terracotta"> *</span>}</label>
      <input type={type} required={required} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="input" />
    </div>
  );
}

function Summary({
  fr, dict, locale, checkIn, checkOut, guests, nights, optionLabel, chosenExtras, selectedExtras, total, flat,
}: {
  fr: boolean; dict: Dictionary; locale: Locale;
  checkIn: string; checkOut: string; guests: number; nights: number;
  optionLabel: string | null;
  chosenExtras: ClientExtra[]; selectedExtras: Record<string, number>;
  total: number; flat?: boolean;
}) {
  const t = dict.stay;
  const a = parseDateOnly(checkIn);
  const b = parseDateOnly(checkOut);
  return (
    <div className={flat ? "mt-6 rounded-2xl bg-sand p-5 text-left" : "card p-5"}>
      <h4 className="font-serif text-lg text-ink">{t.summary}</h4>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label={t.checkIn} value={a ? formatDateHuman(a, locale) : "—"} />
        <Row label={t.checkOut} value={b ? formatDateHuman(b, locale) : "—"} />
        <Row label={t.guests} value={`${guests} · ${nights} ${nights > 1 ? dict.common.nights : dict.common.night}`} />
        {optionLabel && <Row label={fr ? "Formule" : "Option"} value={optionLabel} />}
      </dl>
      {chosenExtras.length > 0 && (
        <div className="mt-3 border-t border-sand-200 pt-3">
          <p className="text-xs uppercase tracking-wide text-muted">Extras</p>
          <ul className="mt-1 space-y-0.5 text-sm text-ink">
            {chosenExtras.map((e) => (
              <li key={e.id}>{e.name}{selectedExtras[e.id] > 1 ? ` ×${selectedExtras[e.id]}` : ""}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between border-t border-sand-300 pt-3">
        <span className="text-sm text-muted">{dict.common.estimatedTotal}</span>
        <span className="font-serif text-2xl text-terracotta">{formatMAD(total, locale)}</span>
      </div>
      <p className="mt-2 text-xs text-muted">{dict.common.finalConfirmation}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
