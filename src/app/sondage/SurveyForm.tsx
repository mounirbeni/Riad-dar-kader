"use client";

import { useActionState } from "react";
import { submitSurveyAction } from "@/app/actions/survey";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-[#E8DDD4] bg-white px-4 py-3 text-sm text-[#2C1A0E] placeholder:text-[#7A6652]/40 transition focus:border-terracotta/40 focus:outline-none focus:ring-2 focus:ring-terracotta/15";

const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-[#7A6652]/70 mb-1.5";

const TOOLS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Téléphone" },
  { value: "excel", label: "Excel / Cahier" },
  { value: "booking", label: "Booking.com" },
  { value: "airbnb", label: "Airbnb" },
  { value: "other", label: "Autre" },
];

export function SurveyForm() {
  const [state, action, pending] = useActionState(submitSurveyAction, { success: false });
  const [hasWebsite, setHasWebsite] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  const toggleTool = (val: string) => {
    setSelectedTools((prev) =>
      prev.includes(val) ? prev.filter((t) => t !== val) : [...prev, val]
    );
  };

  if (state.success) {
    return (
      <div className="rounded-2xl border border-[#E8DDD4] bg-white p-8 text-center shadow-sm">
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-[#2C1A0E]">Merci !</h2>
        <p className="mt-2 text-sm text-[#7A6652]">
          Votre réponse a bien été enregistrée. Nous vous contacterons prochainement.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5 rounded-2xl border border-[#E8DDD4] bg-white p-6 shadow-sm sm:p-8">
      {state.error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
          {state.error}
        </div>
      )}

      {/* Nom du riad */}
      <div>
        <label className={labelCls}>Nom du riad *</label>
        <input name="riadName" required maxLength={100} className={inputCls} placeholder="Riad Al Baraka" />
      </div>

      {/* Propriétaire */}
      <div>
        <label className={labelCls}>Votre nom *</label>
        <input name="ownerName" required maxLength={100} className={inputCls} placeholder="Mohammed Alami" />
      </div>

      {/* Ville */}
      <div>
        <label className={labelCls}>Ville *</label>
        <input name="city" required maxLength={80} defaultValue="Marrakech" className={inputCls} placeholder="Marrakech" />
      </div>

      {/* Phone + Email */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Téléphone *</label>
          <input name="phone" required type="tel" maxLength={30} className={inputCls} placeholder="+212 6XX XXX XXX" />
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input name="email" type="email" className={inputCls} placeholder="facultatif" />
        </div>
      </div>

      {/* Nombre de chambres */}
      <div>
        <label className={labelCls}>Nombre de chambres *</label>
        <input name="roomCount" required type="number" min={1} max={100} className={inputCls} placeholder="5" />
      </div>

      {/* Site web */}
      <div>
        <label className={labelCls}>Avez-vous un site web ?</label>
        <div className="flex gap-3">
          {[{ v: "true", l: "Oui" }, { v: "false", l: "Non" }].map(({ v, l }) => (
            <label key={v} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E8DDD4] py-2.5 text-sm transition hover:border-terracotta/40 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5 has-[:checked]:text-terracotta">
              <input
                type="radio"
                name="hasWebsite"
                value={v}
                className="sr-only"
                onChange={() => setHasWebsite(v === "true")}
                defaultChecked={v === "false"}
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      {/* Réservation en ligne (conditionnel) */}
      {hasWebsite && (
        <div>
          <label className={labelCls}>Votre site a-t-il un système de réservation en ligne ?</label>
          <div className="flex gap-3">
            {[{ v: "true", l: "Oui" }, { v: "false", l: "Non" }].map(({ v, l }) => (
              <label key={v} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#E8DDD4] py-2.5 text-sm transition hover:border-terracotta/40 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5 has-[:checked]:text-terracotta">
                <input type="radio" name="hasOnlineBooking" value={v} className="sr-only" defaultChecked={v === "false"} />
                {l}
              </label>
            ))}
          </div>
        </div>
      )}
      {!hasWebsite && <input type="hidden" name="hasOnlineBooking" value="false" />}

      {/* Outils actuels */}
      <div>
        <label className={labelCls}>Comment gérez-vous vos réservations actuellement ? *</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOOLS.map(({ value, label }) => (
            <label key={value} className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#E8DDD4] px-3 py-2.5 text-sm transition hover:border-terracotta/40 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5 has-[:checked]:text-terracotta">
              <input
                type="checkbox"
                name="currentTools"
                value={value}
                className="sr-only"
                checked={selectedTools.includes(value)}
                onChange={() => toggleTool(value)}
              />
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${selectedTools.includes(value) ? "border-terracotta bg-terracotta" : "border-[#C8B89A]"}`}>
                {selectedTools.includes(value) && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="2 6 5 9 10 3" />
                  </svg>
                )}
              </span>
              {label}
            </label>
          ))}
        </div>
        {/* Hidden fallback if nothing selected — validation will catch it */}
        {selectedTools.map((t) => (
          <input key={t} type="hidden" name="currentTools" value={t} />
        ))}
      </div>

      {/* Intérêt */}
      <div>
        <label className={labelCls}>Seriez-vous intéressé par une plateforme de réservation dédiée à votre riad ? *</label>
        <div className="flex gap-3">
          {[
            { v: "yes", l: "Oui, intéressé" },
            { v: "maybe", l: "Peut-être" },
            { v: "no", l: "Non" },
          ].map(({ v, l }) => (
            <label key={v} className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-[#E8DDD4] px-2 py-2.5 text-center text-xs transition hover:border-terracotta/40 has-[:checked]:border-terracotta has-[:checked]:bg-terracotta/5 has-[:checked]:text-terracotta">
              <input type="radio" name="interest" value={v} className="sr-only" required defaultChecked={v === "yes"} />
              {l}
            </label>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className={labelCls}>Commentaires ou besoins particuliers</label>
        <textarea name="notes" rows={3} maxLength={1000} className={`${inputCls} resize-none`} placeholder="Facultatif…" />
      </div>

      <button
        type="submit"
        disabled={pending || selectedTools.length === 0}
        className="w-full rounded-xl bg-terracotta px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-terracotta/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Envoi en cours…
          </span>
        ) : "Envoyer mes réponses"}
      </button>
    </form>
  );
}
