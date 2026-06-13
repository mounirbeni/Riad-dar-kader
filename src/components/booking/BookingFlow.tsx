"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { searchAvailability, createBooking } from "@/app/actions/booking";
import type { AvailabilityResult, StayOption } from "@/lib/availability";
import { formatMAD } from "@/lib/money";
import { extraLineTotal, priceTypeLabel } from "@/lib/pricing";
import { todayUTC, toDateOnlyString, nightsBetween, parseDateOnly } from "@/lib/dates";
import { Stepper } from "./Stepper";

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
  const today = toDateOnlyString(todayUTC());

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
  const [website, setWebsite] = useState(""); // honeypot

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const nights = useMemo(() => {
    const ci = parseDateOnly(checkIn);
    const co = parseDateOnly(checkOut);
    if (!ci || !co || co <= ci) return 0;
    return nightsBetween(ci, co);
  }, [checkIn, checkOut]);

  const selectedOption = useMemo(
    () => availability?.suggestedOptions.find((o) => o.key === optionKey) || null,
    [availability, optionKey]
  );

  const extrasTotal = useMemo(() => {
    return Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
      const extra = extras.find((e) => e.id === id);
      if (!extra || qty < 1) return sum;
      return sum + extraLineTotal(extra.price, extra.priceType, qty, { guests, nights });
    }, 0);
  }, [selectedExtras, extras, guests, nights]);

  const grandTotal = (selectedOption?.estimatedTotal || 0) + extrasTotal;

  function errMsg(code: string) {
    return (
      (t.errors as Record<string, string>)[code] || t.errors.generic
    );
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
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
    if (!res.result.isAvailable) {
      setError(errMsg(res.result.reason || "no_capacity"));
    }
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

  function setExtraQty(id: string, qty: number) {
    setSelectedExtras((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!optionKey) return;
    setError(null);
    setSubmitting(true);
    const payload = {
      checkIn,
      checkOut,
      guests,
      optionKey,
      guestName,
      guestEmail,
      guestPhone,
      guestCountry,
      specialRequests,
      website,
      extras: Object.entries(selectedExtras).map(([extraId, quantity]) => ({
        extraId,
        quantity,
      })),
    };
    const res = await createBooking(payload);
    setSubmitting(false);
    if (!res.ok) {
      setError(errMsg(res.error));
      return;
    }
    setConfirmation({
      reference: res.reference,
      estimatedTotal: res.estimatedTotal,
      whatsappOwnerUrl: res.whatsappOwnerUrl,
    });
    setStep(5);
  }

  // --- Confirmation screen ---
  if (step === 5 && confirmation) {
    return (
      <div className="mt-10">
        <div className="card mx-auto max-w-xl p-8 text-center sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brass/15 text-3xl text-brass">
            ✓
          </div>
          <h2 className="mt-5 font-serif text-3xl text-ink">{t.confirmTitle}</h2>
          <p className="mt-3 text-muted">{t.confirmText}</p>

          <div className="mt-6 rounded-xl bg-sand p-4">
            <p className="text-xs uppercase tracking-wider text-muted">
              {t.confirmReference}
            </p>
            <p className="mt-1 font-serif text-2xl text-terracotta">
              {confirmation.reference}
            </p>
          </div>

          <SummaryBlock
            t={t}
            dict={dict}
            locale={locale}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            nights={nights}
            optionLabel={selectedOption ? labelFor(selectedOption, locale) : null}
            extras={extras}
            selectedExtras={selectedExtras}
            total={confirmation.estimatedTotal}
            compact
          />

          <a
            href={`https://wa.me/${(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "212600000000").replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
              `${locale === "fr" ? "Bonjour, ma demande de réservation" : "Hello, my reservation request"} ${confirmation.reference}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp mt-6 w-full"
          >
            {t.confirmWhatsapp}
          </a>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-outline mt-3 w-full"
          >
            {t.newSearch}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="card p-5 sm:p-7">
        <Stepper step={step} dict={dict} />
        <div className="mt-6">
          {/* STEP 1 — Dates */}
          {step === 1 && (
            <form onSubmit={onSearch} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="checkIn">
                    {t.checkIn}
                  </label>
                  <input
                    id="checkIn"
                    type="date"
                    min={today}
                    required
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && e.target.value >= checkOut) setCheckOut("");
                    }}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="checkOut">
                    {t.checkOut}
                  </label>
                  <input
                    id="checkOut"
                    type="date"
                    min={checkIn || today}
                    required
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="guests">
                    {t.guests}
                  </label>
                  <input
                    id="guests"
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="input"
                  />
                </div>
              </div>
              {nights > 0 && (
                <p className="text-sm text-muted">
                  {nights}{" "}
                  {nights > 1 ? dict.common.nights : dict.common.night}
                </p>
              )}
              {error && <p className="text-sm text-terracotta">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
                {loading ? t.searching : t.search}
              </button>
            </form>
          )}

          {/* STEP 2 — Availability */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="font-serif text-2xl text-ink">{t.availableTitle}</h3>
              {availability && !availability.isAvailable && (
                <div className="rounded-xl bg-sand p-5 text-muted">
                  {error || t.noAvailability}
                </div>
              )}
              {availability?.isAvailable && (
                <div className="space-y-3">
                  {availability.suggestedOptions.map((option) => {
                    const selected = optionKey === option.key;
                    return (
                      <button
                        type="button"
                        key={option.key}
                        onClick={() => setOptionKey(option.key)}
                        className={`flex w-full flex-col gap-1 rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-terracotta bg-terracotta/5 ring-1 ring-terracotta"
                            : "border-sand-300 bg-white hover:border-brass"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-serif text-lg text-ink">
                            {labelFor(option, locale)}
                          </span>
                          <span className="text-right text-sm font-medium text-terracotta">
                            {formatMAD(option.estimatedTotal, locale)}
                          </span>
                        </div>
                        <p className="text-sm text-muted">
                          {locale === "fr"
                            ? option.descriptionFr
                            : option.descriptionEn}
                        </p>
                        <span className="mt-1 text-xs text-muted">
                          {option.roomsRequired}{" "}
                          {option.roomsRequired > 1
                            ? locale === "fr"
                              ? "chambres"
                              : "rooms"
                            : locale === "fr"
                              ? "chambre"
                              : "room"}{" "}
                          · {option.maxGuests} {dict.common.guests} max ·{" "}
                          {selected ? (
                            <span className="font-medium text-terracotta">
                              {t.selected}
                            </span>
                          ) : (
                            t.selectOption
                          )}
                        </span>
                      </button>
                    );
                  })}
                  <p className="rounded-lg bg-sand px-4 py-3 text-xs text-muted">
                    {dict.common.estimatedTotal}. {dict.common.finalConfirmation}
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-outline">
                  {t.back}
                </button>
                {availability?.isAvailable && (
                  <button
                    type="button"
                    disabled={!optionKey}
                    onClick={() => setStep(3)}
                    className="btn-primary"
                  >
                    {t.continue}
                  </button>
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
                    <div
                      key={extra.id}
                      className={`rounded-2xl border p-4 transition ${
                        active
                          ? "border-terracotta bg-terracotta/5"
                          : "border-sand-300 bg-white"
                      }`}
                    >
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleExtra(extra.id)}
                          className="mt-1 h-4 w-4 accent-terracotta"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-ink">{extra.name}</span>
                            <span className="text-sm text-brass">
                              {extra.price > 0
                                ? formatMAD(extra.price, locale)
                                : locale === "fr"
                                  ? "Inclus"
                                  : "Included"}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-muted">
                            {extra.description}
                          </p>
                          {extra.price > 0 && (
                            <span className="text-[11px] text-muted">
                              {priceTypeLabel(extra.priceType, locale)}
                            </span>
                          )}
                        </div>
                      </label>
                      {active && extra.priceType === "per_booking" && extra.price > 0 && (
                        <div className="mt-3 flex items-center gap-2 pl-7">
                          <span className="text-xs text-muted">Qté</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            value={selectedExtras[extra.id]}
                            onChange={(e) =>
                              setExtraQty(extra.id, Number(e.target.value))
                            }
                            className="w-16 rounded-lg border border-sand-300 px-2 py-1 text-sm"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-outline">
                  {t.back}
                </button>
                <button type="button" onClick={() => setStep(4)} className="btn-primary">
                  {t.continue}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 — Guest details */}
          {step === 4 && (
            <form onSubmit={onSubmit} className="space-y-5">
              <h3 className="font-serif text-2xl text-ink">{t.detailsTitle}</h3>
              {/* honeypot */}
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t.fullName}</label>
                  <input
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t.phone}</label>
                  <input
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+212…"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">{t.country}</label>
                  <input
                    value={guestCountry}
                    onChange={(e) => setGuestCountry(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="label">{t.specialRequests}</label>
                <textarea
                  rows={3}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="input"
                />
              </div>

              <SummaryBlock
                t={t}
                dict={dict}
                locale={locale}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                nights={nights}
                optionLabel={selectedOption ? labelFor(selectedOption, locale) : null}
                extras={extras}
                selectedExtras={selectedExtras}
                total={grandTotal}
              />

              {error && <p className="text-sm text-terracotta">{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(3)} className="btn-outline">
                  {t.back}
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? t.submitting : t.submit}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function labelFor(option: StayOption, locale: Locale): string {
  return locale === "fr" ? option.labelFr : option.labelEn;
}

function SummaryBlock({
  t,
  dict,
  locale,
  checkIn,
  checkOut,
  guests,
  nights,
  optionLabel,
  extras,
  selectedExtras,
  total,
  compact,
}: {
  t: Dictionary["stay"];
  dict: Dictionary;
  locale: Locale;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  optionLabel: string | null;
  extras: ClientExtra[];
  selectedExtras: Record<string, number>;
  total: number;
  compact?: boolean;
}) {
  const chosen = extras.filter((e) => selectedExtras[e.id]);
  return (
    <div className={`rounded-2xl bg-sand p-5 ${compact ? "mt-6 text-left" : ""}`}>
      <h4 className="font-serif text-lg text-ink">{t.summary}</h4>
      <dl className="mt-3 space-y-1.5 text-sm">
        <Row label={t.checkIn} value={checkIn} />
        <Row label={t.checkOut} value={checkOut} />
        <Row
          label={t.guests}
          value={`${guests} · ${nights} ${
            nights > 1 ? dict.common.nights : dict.common.night
          }`}
        />
        {optionLabel && <Row label="Formule" value={optionLabel} />}
        {chosen.length > 0 && (
          <div className="pt-1">
            <dt className="text-muted">Extras</dt>
            <ul className="mt-1 space-y-0.5">
              {chosen.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span className="text-ink">
                    {e.name}
                    {selectedExtras[e.id] > 1 ? ` ×${selectedExtras[e.id]}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </dl>
      <div className="mt-4 flex items-center justify-between border-t border-sand-300 pt-3">
        <span className="text-sm text-muted">{dict.common.estimatedTotal}</span>
        <span className="font-serif text-xl text-terracotta">
          {formatMAD(total, locale)}
        </span>
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
