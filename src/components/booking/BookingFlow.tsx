"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { searchAvailability, createBooking } from "@/app/actions/booking";
import type { AvailabilityResult } from "@/lib/availability";
import { formatEUR } from "@/lib/money";
import { extraLineTotal, priceTypeLabel } from "@/lib/pricing";
import { nightsBetween, parseDateOnly, formatDateHuman } from "@/lib/dates";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import {
  IconCheck,
  IconBed,
  IconUser,
  IconMoon,
  IconArrowLeft,
  IconArrowRight,
} from "@/components/Icons";

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

const TOTAL_STEPS = 4;

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
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
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

  const availableRooms = availability?.availableRoomsDetail ?? [];
  const selectedRooms = useMemo(
    () => availableRooms.filter((r) => selectedRoomIds.includes(r.id)),
    [availableRooms, selectedRoomIds]
  );
  const selectedCapacity = selectedRooms.reduce((s, r) => s + r.capacity, 0);
  const roomsTotal = selectedRooms.reduce((s, r) => s + r.basePrice * nights, 0);
  const canBook = selectedRooms.length > 0 && selectedCapacity >= guests;
  const selectedRoomNames = selectedRooms.map((r) => r.name).join(" + ");

  const extrasTotal = useMemo(
    () =>
      Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
        const e = extras.find((x) => x.id === id);
        if (!e || qty < 1) return sum;
        return sum + extraLineTotal(e.price, e.priceType, qty, { guests, nights });
      }, 0),
    [selectedExtras, extras, guests, nights]
  );

  const grandTotal = roomsTotal + extrasTotal;
  const chosenExtras = extras.filter((e) => selectedExtras[e.id]);

  function toggleRoom(id: string) {
    setSelectedRoomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const errMsg = (code: string) =>
    (t.errors as Record<string, string>)[code] || t.errors.generic;

  function goTo(n: number) {
    setDirection(n > step ? "forward" : "back");
    setStep(n);
  }

  async function onSearch() {
    if (!checkIn || !checkOut || nights < 1) {
      setError(errMsg("invalid_dates"));
      return;
    }
    setError(null);
    setLoading(true);
    setSelectedRoomIds([]);
    const res = await searchAvailability({ checkIn, checkOut, guests });
    setLoading(false);
    if (!res.ok) {
      setError(errMsg(res.error));
      setAvailability(null);
      return;
    }
    setAvailability(res.result);
    if (!res.result.isAvailable) setError(errMsg(res.result.reason || "no_capacity"));
    goTo(2);
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
    if (!canBook) return;
    setError(null);
    setSubmitting(true);
    const res = await createBooking({
      checkIn, checkOut, guests, roomIds: selectedRoomIds,
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
    goTo(5);
  }

  const includedFeatures = fr
    ? ["Confirmation directe par le riad", "Sans paiement en ligne", "Annulation flexible"]
    : ["Confirmed directly by the riad", "No online payment", "Flexible cancellation"];

  // ---------- Confirmation ----------
  if (step === 5 && confirmation) {
    return (
      <div className="mt-10 animate-step-in">
        <div className="mx-auto max-w-xl overflow-hidden rounded-3xl shadow-xl">
          {/* Celebratory header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-terracotta to-terracotta-dark px-8 py-12 text-center text-white">
            <div className="absolute inset-0 bg-zellige opacity-20" />
            <div className="relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-sm">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-terracotta">
                  <IconCheck size={28} />
                </div>
              </div>
              <h2 className="mt-5 font-serif text-3xl">{t.confirmTitle}</h2>
              <p className="mx-auto mt-2 max-w-sm text-white/85 text-sm leading-relaxed">{t.confirmText}</p>
            </div>
          </div>

          <div className="bg-white p-8">
            {/* Reference number */}
            <div className="rounded-2xl border-2 border-dashed border-brass/30 bg-sand/60 p-5 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{t.confirmReference}</p>
              <p className="mt-1.5 font-mono text-3xl font-bold tracking-widest text-terracotta">{confirmation.reference}</p>
            </div>

            {/* Stay summary */}
            <div className="mt-6 space-y-3">
              <SummaryRow
                fr={fr} dict={dict} locale={locale}
                checkIn={checkIn} checkOut={checkOut} guests={guests} nights={nights}
                optionLabel={selectedRoomNames || null}
                chosenExtras={chosenExtras} selectedExtras={selectedExtras}
                total={confirmation.estimatedTotal}
              />
            </div>

            <a
              href={confirmation.whatsappOwnerUrl}
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
      </div>
    );
  }

  const showSummary = nights > 0 && step >= 2;
  const progress = Math.round(((step - 1) / TOTAL_STEPS) * 100);

  return (
    <div className="mt-6">
      {/* Progress bar + step indicator */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between text-xs text-muted">
          <span className="font-medium text-ink">
            {step <= TOTAL_STEPS
              ? `${fr ? "Étape" : "Step"} ${step} ${fr ? "sur" : "of"} ${TOTAL_STEPS}`
              : fr ? "Réservation envoyée" : "Booking sent"}
          </span>
          {nights > 0 && (
            <span className="font-medium text-terracotta">
              {nights} {nights > 1 ? dict.common.nights : dict.common.night}
            </span>
          )}
        </div>
        {/* Progress track */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-sand-300">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-terracotta to-brass transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step pills */}
        <div className="mt-3 flex justify-between">
          {[
            t.step1 || (fr ? "Dates" : "Dates"),
            t.step2 || (fr ? "Chambre" : "Room"),
            t.step3 || (fr ? "Extras" : "Extras"),
            t.step4 || (fr ? "Détails" : "Details"),
          ].map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold transition-all duration-300 ${
                    active
                      ? "bg-terracotta text-white shadow-md shadow-terracotta/30 scale-110"
                      : done
                        ? "bg-brass text-white"
                        : "bg-sand-200 text-muted"
                  }`}
                >
                  {done ? <IconCheck size={12} /> : n}
                </div>
                <span className={`hidden text-[10px] sm:block transition-colors ${active ? "font-semibold text-ink" : "text-muted"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Main card */}
        <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-card">
          <div key={step} className={direction === "forward" ? "animate-step-in" : "animate-step-back"}>

            {/* ── STEP 1 — Calendar ── */}
            {step === 1 && (
              <div>
                {/* Header bar */}
                <div className="border-b border-sand-100 bg-sand/40 px-6 py-4">
                  <h2 className="font-serif text-xl text-ink">
                    {fr ? "Choisissez vos dates" : "Choose your dates"}
                  </h2>
                  <p className="text-sm text-muted">
                    {fr ? "Sélectionnez votre arrivée et votre départ" : "Select your check-in and check-out"}
                  </p>
                </div>

                <div className="p-5 sm:p-7">
                  {/* Calendar — centered, fills the card */}
                  <AvailabilityCalendar
                    locale={locale}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onSelect={(ci, co) => { setCheckIn(ci); setCheckOut(co); setError(null); }}
                  />

                  {/* Date + guest row */}
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <DateChip
                      label={t.checkIn}
                      value={checkIn ? formatDateHuman(parseDateOnly(checkIn)!, locale) : undefined}
                      active={!!checkIn}
                    />
                    <span className="text-sand-300">→</span>
                    <DateChip
                      label={t.checkOut}
                      value={checkOut ? formatDateHuman(parseDateOnly(checkOut)!, locale) : undefined}
                      active={!!checkOut}
                    />
                    <div className="ml-auto">
                      <GuestStepper label={t.guests} value={guests} onChange={setGuests} />
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold">!</span>
                      {error}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={loading || nights < 1}
                    onClick={onSearch}
                    className="btn-primary mt-5 w-full py-3.5 text-base disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t.searching}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        {t.search}
                        <IconArrowRight size={16} />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 — Options ── */}
            {step === 2 && (
              <div>
                <div className="border-b border-sand-100 bg-sand/40 px-6 py-4">
                  <h2 className="font-serif text-xl text-ink">{t.availableTitle}</h2>
                  <p className="text-sm text-muted">
                    {checkIn && checkOut
                      ? `${formatDateHuman(parseDateOnly(checkIn)!, locale)} → ${formatDateHuman(parseDateOnly(checkOut)!, locale)} · ${guests} ${dict.common.guests}`
                      : ""}
                  </p>
                </div>

                <div className="p-5 sm:p-7 space-y-4">
                  {availability && !availability.isAvailable && (
                    <div className="rounded-2xl bg-sand p-6 text-center text-muted">
                      <p className="font-serif text-xl text-ink mb-1">{fr ? "Désolé" : "Sorry"}</p>
                      <p className="text-sm">{error || t.noAvailability}</p>
                    </div>
                  )}

                  {availability?.isAvailable && (
                    <>
                      {/* Availability banner — reassure the guest rooms are free */}
                      {availability.availableRoomsCount > 0 && (
                        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5">
                          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                            <IconCheck size={13} />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-green-800">
                              {availability.availableRoomsCount >= availability.totalRoomsCount
                                ? t.roomsAvailableAll
                                : `${availability.availableRoomsCount} ${t.roomsAvailableSome}`}
                            </p>
                            {availability.availableRoomNames.length > 0 && (
                              <p className="mt-0.5 text-xs text-green-700/80">
                                {availability.availableRoomNames.join(" · ")}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Selectable room cards — pick the room(s) you want */}
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                          {fr ? "Sélectionnez votre chambre" : "Select your room"}
                        </p>
                        <div className="space-y-3">
                          {availability.availableRoomsDetail.map((room) => {
                            const selected = selectedRoomIds.includes(room.id);
                            return (
                              <button
                                type="button"
                                key={room.id}
                                onClick={() => toggleRoom(room.id)}
                                className={`group block w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                                  selected
                                    ? "border-terracotta bg-terracotta/[0.03] shadow-md shadow-terracotta/10"
                                    : "border-sand-200 bg-white hover:border-terracotta/40 hover:shadow-sm"
                                }`}
                              >
                                <div className="flex items-center gap-4">
                                  <span
                                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                      selected
                                        ? "bg-terracotta text-white"
                                        : "bg-terracotta/10 text-terracotta group-hover:bg-terracotta/15"
                                    }`}
                                  >
                                    <IconBed size={22} />
                                  </span>

                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="font-serif text-lg text-ink">{room.name}</h4>
                                      <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                                        <IconCheck size={10} />
                                        {fr ? "Disponible" : "Available"}
                                      </span>
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                                      <span className="flex items-center gap-1">
                                        <IconUser size={12} />
                                        {fr ? "jusqu'à" : "up to"} {room.capacity} {dict.common.guests}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <IconMoon size={12} />
                                        {nights} {nights > 1 ? dict.common.nights : dict.common.night}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="shrink-0 text-right">
                                    <p className="font-serif text-2xl font-semibold text-terracotta">
                                      {formatEUR(room.basePrice, locale)}
                                    </p>
                                    <p className="text-[11px] text-muted">/ {dict.common.night}</p>
                                  </div>

                                  {/* Check toggle */}
                                  <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                                      selected
                                        ? "border-terracotta bg-terracotta text-white"
                                        : "border-sand-300 bg-white text-transparent"
                                    }`}
                                  >
                                    <IconCheck size={14} />
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {/* Capacity hint when more guests than one room holds */}
                        {selectedRooms.length > 0 && selectedCapacity < guests && (
                          <p className="mt-3 flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-xs font-bold text-white">!</span>
                            {fr
                              ? `Capacité sélectionnée ${selectedCapacity}/${guests}. Ajoutez une chambre.`
                              : `Selected capacity ${selectedCapacity}/${guests}. Add another room.`}
                          </p>
                        )}
                      </div>

                      {/* Guarantees */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 rounded-xl bg-sand/50 px-4 py-3 text-xs text-muted">
                        {includedFeatures.map((f) => (
                          <span key={f} className="flex items-center gap-1.5">
                            <IconCheck size={11} className="text-brass shrink-0" />
                            {f}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => goTo(1)} className="btn-outline flex items-center gap-1.5">
                      <IconArrowLeft size={14} />
                      {t.back}
                    </button>
                    {availability?.isAvailable && (
                      <button
                        type="button"
                        disabled={!canBook}
                        onClick={() => goTo(3)}
                        className="btn-primary flex flex-1 items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {t.continue}
                        <IconArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3 — Extras ── */}
            {step === 3 && (
              <div>
                <div className="border-b border-sand-100 bg-sand/40 px-6 py-4">
                  <h2 className="font-serif text-xl text-ink">{t.extrasTitle}</h2>
                  <p className="text-sm text-muted">{t.extrasSubtitle}</p>
                </div>

                <div className="p-5 sm:p-7">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {extras.map((extra) => {
                      const active = !!selectedExtras[extra.id];
                      return (
                        <button
                          type="button"
                          key={extra.id}
                          onClick={() => toggleExtra(extra.id)}
                          className={`group relative rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                            active
                              ? "border-terracotta bg-terracotta/[0.03] shadow-sm"
                              : "border-sand-200 bg-white hover:border-terracotta/40"
                          }`}
                        >
                          {/* Check indicator */}
                          <span
                            className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                              active
                                ? "border-terracotta bg-terracotta text-white"
                                : "border-sand-300 bg-white"
                            }`}
                          >
                            {active && <IconCheck size={12} />}
                          </span>

                          <p className="pr-8 font-medium text-ink">{extra.name}</p>
                          <p className="mt-1 text-xs leading-snug text-muted">{extra.description}</p>
                          <p className="mt-2.5 text-sm font-semibold text-brass">
                            {extra.price > 0
                              ? `${formatEUR(extra.price, locale)} `
                              : (fr ? "Inclus " : "Included ")}
                            {extra.price > 0 && (
                              <span className="text-[11px] font-normal text-muted">
                                {priceTypeLabel(extra.priceType, locale)}
                              </span>
                            )}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button type="button" onClick={() => goTo(2)} className="btn-outline flex items-center gap-1.5">
                      <IconArrowLeft size={14} />
                      {t.back}
                    </button>
                    <button type="button" onClick={() => goTo(4)} className="btn-primary flex flex-1 items-center justify-center gap-1.5">
                      {t.continue}
                      <IconArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4 — Guest details ── */}
            {step === 4 && (
              <div>
                <div className="border-b border-sand-100 bg-sand/40 px-6 py-4">
                  <h2 className="font-serif text-xl text-ink">{t.detailsTitle}</h2>
                  <p className="text-sm text-muted">
                    {fr ? "Dernière étape — vos coordonnées" : "Last step — your contact details"}
                  </p>
                </div>

                <form onSubmit={onSubmit} className="p-5 sm:p-7 space-y-4">
                  {/* honeypot */}
                  <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t.fullName} required value={guestName} onChange={setGuestName} />
                    <Field label={t.email} type="email" required value={guestEmail} onChange={setGuestEmail} />
                    <Field label={t.phone} required value={guestPhone} onChange={setGuestPhone} placeholder="+33…" />
                    <Field label={t.country} value={guestCountry} onChange={setGuestCountry} />
                  </div>

                  <div>
                    <label className="label">{t.specialRequests}</label>
                    <textarea
                      rows={3}
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      className="input resize-none"
                    />
                  </div>

                  {/* Total summary */}
                  <div className="rounded-2xl bg-gradient-to-br from-terracotta/5 to-brass/5 border border-sand-200 px-5 py-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted">{dict.common.estimatedTotal}</span>
                      <span className="font-serif text-2xl text-terracotta">{formatEUR(grandTotal, locale)}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{dict.common.finalConfirmation}</p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl bg-terracotta/5 px-4 py-3 text-sm text-terracotta">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terracotta/15 text-xs font-bold">!</span>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => goTo(3)} className="btn-outline flex items-center gap-1.5">
                      <IconArrowLeft size={14} />
                      {t.back}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-primary flex flex-1 items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {t.submitting}
                        </>
                      ) : (
                        <>
                          {t.submit}
                          <IconCheck size={15} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Sticky summary sidebar */}
        {showSummary && (
          <aside className="lg:sticky lg:top-20 animate-step-in">
            <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-card">
              <h4 className="font-serif text-lg text-ink">{t.summary}</h4>
              <SummaryRow
                fr={fr} dict={dict} locale={locale}
                checkIn={checkIn} checkOut={checkOut} guests={guests} nights={nights}
                optionLabel={selectedRoomNames || null}
                chosenExtras={chosenExtras} selectedExtras={selectedExtras}
                total={grandTotal}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

function DateChip({ label, value, active }: { label: string; value?: string; active: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 transition-colors ${active ? "border-terracotta/40 bg-terracotta/5" : "border-sand-300 bg-white"}`}>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <p className={`text-sm font-medium ${active ? "text-ink" : "text-muted"}`}>{value || "—"}</p>
    </div>
  );
}

function GuestStepper({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted">{label}</p>
      <div className="mt-1 flex items-center gap-0.5 rounded-xl border border-sand-300 bg-white p-0.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          disabled={value <= 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-light text-terracotta transition hover:bg-sand disabled:opacity-30"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-semibold text-ink">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          disabled={value >= 20}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg font-light text-terracotta transition hover:bg-sand disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", required, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; placeholder?: string;
}) {
  return (
    <div>
      <label className="label">
        {label}
        {required && <span className="text-terracotta"> *</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </div>
  );
}

function SummaryRow({
  fr, dict, locale, checkIn, checkOut, guests, nights, optionLabel, chosenExtras, selectedExtras, total,
}: {
  fr: boolean; dict: Dictionary; locale: Locale;
  checkIn: string; checkOut: string; guests: number; nights: number;
  optionLabel: string | null;
  chosenExtras: ClientExtra[]; selectedExtras: Record<string, number>;
  total: number;
}) {
  const t = dict.stay;
  const a = parseDateOnly(checkIn);
  const b = parseDateOnly(checkOut);
  return (
    <>
      <dl className="mt-3 space-y-2 text-sm">
        <Row label={t.checkIn} value={a ? formatDateHuman(a, locale) : "—"} />
        <Row label={t.checkOut} value={b ? formatDateHuman(b, locale) : "—"} />
        <Row label={t.guests} value={`${guests} · ${nights} ${nights > 1 ? dict.common.nights : dict.common.night}`} />
        {optionLabel && <Row label={fr ? "Chambre" : "Room"} value={optionLabel} />}
      </dl>
      {chosenExtras.length > 0 && (
        <div className="mt-3 border-t border-sand-200 pt-3">
          <p className="text-xs uppercase tracking-wide text-muted">Extras</p>
          <ul className="mt-1 space-y-0.5 text-sm text-ink">
            {chosenExtras.map((e) => (
              <li key={e.id}>
                {e.name}
                {selectedExtras[e.id] > 1 ? ` ×${selectedExtras[e.id]}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-terracotta/5 px-4 py-3">
        <span className="text-sm text-muted">{dict.common.estimatedTotal}</span>
        <span className="font-serif text-xl text-terracotta">{formatEUR(total, locale)}</span>
      </div>
      <p className="mt-2 text-xs text-muted">{dict.common.finalConfirmation}</p>
    </>
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
