"use client";

import { useState, useTransition } from "react";
import { submitSurveyAction, type SurveyData } from "@/app/actions/survey";

type Locale = "fr" | "en";

type State = Omit<SurveyData, "locale">;

const EMPTY: State = {
  riadName: "", city: "", roomCount: "", yearsOpen: "",
  bookingMethods: [], hasWebsite: "", platforms: [], directPct: "", occupancyRate: "",
  challenges: [], adminTimeDay: "", lostBookings: "", biggestStress: "",
  wantedFeatures: [], techComfort: "", wantsArabic: "", usesSmartphone: "",
  currentlyPays: "", currentAmount: "", willingToPay: "", payPreference: "", commissionOk: "",
  wantsDemo: false, contactName: "", contactWa: "", comments: "",
};

const D = {
  fr: {
    badge: "Sondage Confidentiel",
    title: "Aidez-nous à créer la plateforme idéale pour votre riad",
    subtitle: "5 minutes · Gratuit · Vos réponses restent confidentielles",
    next: "Suivant →",
    back: "← Retour",
    submit: "Envoyer le sondage",
    submitting: "Envoi…",
    doneTitle: "Merci beaucoup !",
    doneText: "Vos réponses ont été enregistrées. Si vous avez demandé une démo, nous vous contacterons sous 48h sur WhatsApp.",
    steps: ["Votre Riad", "Situation actuelle", "Difficultés", "Fonctionnalités", "Budget", "Contact"],
    s1: {
      title: "Parlez-nous de votre riad",
      q1: "Nom de votre riad *", q2: "Ville *", q3: "Nombre de chambres *", q4: "Depuis combien de temps êtes-vous en activité ? *",
      cities: ["Marrakech — Médina", "Marrakech — Guéliz / Palmeraie", "Fès", "Essaouira", "Chefchaouen", "Rabat", "Meknès", "Agadir", "Autre"],
      rooms: ["1–3 chambres", "4–6 chambres", "7–10 chambres", "+10 chambres"],
      years: ["Moins d'1 an", "1–3 ans", "3–7 ans", "Plus de 7 ans"],
    },
    s2: {
      title: "Votre situation actuelle",
      q5: "Comment gérez-vous vos réservations ?", q6: "Avez-vous un site web pour votre riad ? *",
      q7: "Quelles plateformes utilisez-vous ?", q8: "% de réservations en direct (sans commission) *", q9: "Taux d'occupation moyen par mois *",
      methods: ["WhatsApp / Téléphone", "Cahier papier / Excel", "Booking.com / Airbnb", "Un logiciel dédié", "Mon propre site web", "Agence de voyage"],
      web: ["Oui, avec réservation en ligne", "Oui, mais sans réservation", "Non"],
      platforms: ["Booking.com", "Airbnb", "Expedia", "Instagram / Facebook", "Direct (WhatsApp / email)", "Agence de voyage", "Aucune"],
      direct: ["Moins de 20%", "20–40%", "40–60%", "Plus de 60%", "Je ne sais pas"],
      occ: ["Moins de 30%", "30–50%", "50–70%", "Plus de 70%"],
    },
    s3: {
      title: "Vos difficultés au quotidien",
      q10: "Vos plus grands défis ? (3 max)", q11: "Temps passé par jour sur les tâches admin *",
      q12: "Avez-vous déjà perdu une réservation par manque d'organisation ? *", q13: "Principale source de stress *",
      challenges: ["Gérer les disponibilités", "Éviter les doubles réservations", "Communiquer avec les clients", "Suivre les paiements", "Gérer le personnel", "Obtenir des réservations directes", "Gérer le ménage", "Envoyer des confirmations", "Gérer plusieurs plateformes"],
      time: ["Moins de 30 min", "30 min – 1h", "1h – 3h", "Plus de 3h"],
      lost: ["Oui, souvent", "Oui, quelquefois", "Rarement", "Jamais"],
      stress: ["Répondre rapidement aux messages", "Gérer les annulations de dernière minute", "Coordonner le ménage", "Suivre les revenus", "Gérer plusieurs calendriers", "Trouver de nouveaux clients"],
    },
    s4: {
      title: "Fonctionnalités & Technologie",
      q14: "Fonctionnalités essentielles pour vous ? (5 max)", q15: "Votre aisance avec les outils numériques *",
      q16: "Souhaitez-vous une interface en arabe ? *", q17: "Quel appareil utilisez-vous principalement ? *",
      features: ["Réservation en ligne sur votre site", "Calendrier des disponibilités", "Paiement en ligne", "Emails automatiques de confirmation", "Messagerie privée avec les clients", "Modèles de messages WhatsApp", "Gestion du ménage et du personnel", "Rapports de revenus", "Base de données clients", "Site web bilingue FR / EN", "Application mobile", "Sync Booking.com / Airbnb"],
      tech: ["Très à l'aise", "Assez à l'aise", "Je me débrouille", "Pas à l'aise"],
      arabic: ["Oui, c'est essentiel", "Oui, ce serait un plus", "Non, FR / EN suffit"],
      device: ["Uniquement smartphone", "Smartphone + PC", "Principalement PC / tablette"],
    },
    s5: {
      title: "Budget & Modèle économique",
      q18: "Payez-vous déjà pour un outil de gestion ? *", q19: "Combien payez-vous par mois ? (MAD ou EUR)",
      q20: "Pour une plateforme tout-en-un, combien seriez-vous prêt(e) à payer/mois ? *",
      q21: "Comment préférez-vous payer ? *",
      q22: "Accepteriez-vous 3–5% de commission par réservation en échange d'une plateforme gratuite ? *",
      pays: ["Oui", "Non"],
      amounts: ["Moins de 200 MAD (~18€)", "200–500 MAD (~18–45€)", "500–900 MAD (~45–80€)", "Plus de 900 MAD (80€+)", "Je ne paierais pas"],
      pref: ["Mensuel", "Annuel (avec réduction)", "Achat unique", "Gratuit + commission"],
      comm: ["Oui", "Peut-être", "Non"],
    },
    s6: {
      title: "Contact & Démo gratuite",
      q23: "Souhaitez-vous une démonstration gratuite ? *", q24: "Votre prénom et numéro WhatsApp",
      q25: "Commentaires, suggestions ou questions ?",
      demo: ["Oui, je suis intéressé(e)", "Non merci"],
      placeholder24: "Ex : Ahmed · +212 6XX XXX XXX",
      placeholder25: "Partagez tout ce qui pourrait nous aider…",
    },
  },
  en: {
    badge: "Confidential Survey",
    title: "Help us build the perfect platform for your riad",
    subtitle: "5 minutes · Free · Your answers remain confidential",
    next: "Next →",
    back: "← Back",
    submit: "Submit survey",
    submitting: "Sending…",
    doneTitle: "Thank you!",
    doneText: "Your answers have been recorded. If you requested a demo, we will contact you within 48h on WhatsApp.",
    steps: ["Your Riad", "Current situation", "Challenges", "Features", "Budget", "Contact"],
    s1: {
      title: "Tell us about your riad",
      q1: "Name of your riad *", q2: "City *", q3: "Number of rooms *", q4: "How long have you been operating? *",
      cities: ["Marrakech — Médina", "Marrakech — Guéliz / Palmeraie", "Fès", "Essaouira", "Chefchaouen", "Rabat", "Meknès", "Agadir", "Other"],
      rooms: ["1–3 rooms", "4–6 rooms", "7–10 rooms", "+10 rooms"],
      years: ["Less than 1 year", "1–3 years", "3–7 years", "More than 7 years"],
    },
    s2: {
      title: "Your current situation",
      q5: "How do you manage reservations?", q6: "Do you have a website for your riad? *",
      q7: "Which platforms do you use?", q8: "% of direct bookings (no commission) *", q9: "Average monthly occupancy rate *",
      methods: ["WhatsApp / Phone", "Notebook / Excel", "Booking.com / Airbnb", "Dedicated software", "My own website", "Travel agency"],
      web: ["Yes, with online booking", "Yes, but no booking", "No"],
      platforms: ["Booking.com", "Airbnb", "Expedia", "Instagram / Facebook", "Direct (WhatsApp / email)", "Travel agency", "None"],
      direct: ["Less than 20%", "20–40%", "40–60%", "More than 60%", "I don't know"],
      occ: ["Less than 30%", "30–50%", "50–70%", "More than 70%"],
    },
    s3: {
      title: "Your daily challenges",
      q10: "Your biggest challenges? (max 3)", q11: "Time spent daily on admin tasks *",
      q12: "Have you ever lost a booking due to poor organization? *", q13: "Main source of daily stress *",
      challenges: ["Managing availability", "Avoiding double bookings", "Communicating with guests", "Tracking payments", "Managing staff", "Getting direct bookings", "Managing housekeeping", "Sending confirmations", "Managing multiple platforms"],
      time: ["Less than 30 min", "30 min – 1h", "1h – 3h", "More than 3h"],
      lost: ["Yes, often", "Yes, a few times", "Rarely", "Never"],
      stress: ["Responding to messages quickly", "Handling last-minute cancellations", "Coordinating cleaning", "Tracking revenue", "Managing multiple calendars", "Finding new guests"],
    },
    s4: {
      title: "Features & Technology",
      q14: "Essential features for you? (max 5)", q15: "Your comfort with digital tools *",
      q16: "Would you like an Arabic interface? *", q17: "Which device do you use primarily? *",
      features: ["Online booking on your website", "Availability calendar", "Online payment", "Automatic confirmation emails", "Private guest messaging", "WhatsApp message templates", "Housekeeping & staff management", "Revenue reports", "Guest database", "FR / EN bilingual website", "Mobile app", "Booking.com / Airbnb sync"],
      tech: ["Very comfortable", "Fairly comfortable", "I manage", "Not comfortable"],
      arabic: ["Yes, it's essential", "Yes, it would be a plus", "No, FR / EN is enough"],
      device: ["Smartphone only", "Smartphone + PC", "Mainly PC / tablet"],
    },
    s5: {
      title: "Budget & Pricing model",
      q18: "Do you currently pay for a management tool? *", q19: "How much do you pay per month? (MAD or EUR)",
      q20: "For an all-in-one platform, how much would you pay/month? *",
      q21: "How do you prefer to pay? *",
      q22: "Would you accept 3–5% commission per booking in exchange for a free platform? *",
      pays: ["Yes", "No"],
      amounts: ["Less than 200 MAD (~€18)", "200–500 MAD (~€18–45)", "500–900 MAD (~€45–80)", "More than 900 MAD (€80+)", "I wouldn't pay"],
      pref: ["Monthly", "Annual (with discount)", "One-time purchase", "Free + commission"],
      comm: ["Yes", "Maybe", "No"],
    },
    s6: {
      title: "Contact & Free demo",
      q23: "Would you like a free platform demo? *", q24: "Your first name and WhatsApp number",
      q25: "Comments, suggestions or questions?",
      demo: ["Yes, I'm interested", "No thanks"],
      placeholder24: "E.g. Ahmed · +212 6XX XXX XXX",
      placeholder25: "Share anything that could help us…",
    },
  },
} as const;

function Radio({ name, value, checked, onChange, label }: { name: string; value: string; checked: boolean; onChange: () => void; label: string }) {
  return (
    <label onClick={onChange} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${checked ? "border-terracotta bg-terracotta/5 text-ink" : "border-sand-200 bg-white text-ink/70 hover:border-terracotta/40"}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${checked ? "border-terracotta" : "border-sand-200"}`}>
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-terracotta" />}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <label onClick={disabled && !checked ? undefined : onChange} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all ${disabled && !checked ? "opacity-40 cursor-not-allowed" : ""} ${checked ? "border-terracotta bg-terracotta/5 text-ink" : "border-sand-200 bg-white text-ink/70 hover:border-terracotta/40"}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border-2 transition-colors ${checked ? "border-terracotta bg-terracotta" : "border-sand-200"}`}>
        {checked && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span className="text-sm">{label}</span>
    </label>
  );
}

function toggle(arr: string[], val: string, max?: number): string[] {
  if (arr.includes(val)) return arr.filter(v => v !== val);
  if (max && arr.length >= max) return arr;
  return [...arr, val];
}

export function SurveyForm() {
  const [locale, setLocale] = useState<Locale>("fr");
  const t = D[locale];
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState<State>(EMPTY);

  const set = (key: keyof State, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  function canNext(): boolean {
    if (step === 0) return !!form.riadName.trim() && !!form.city && !!form.roomCount && !!form.yearsOpen;
    if (step === 1) return !!form.hasWebsite && !!form.directPct && !!form.occupancyRate;
    if (step === 2) return !!form.adminTimeDay && !!form.lostBookings && !!form.biggestStress;
    if (step === 3) return !!form.techComfort && !!form.wantsArabic && !!form.usesSmartphone;
    if (step === 4) return !!form.currentlyPays && !!form.willingToPay && !!form.payPreference && !!form.commissionOk;
    return true;
  }

  function handleSubmit() {
    startTransition(async () => {
      await submitSurveyAction({ ...form, locale });
      setDone(true);
    });
  }

  if (done) {
    return (
      <div className="text-center py-16 px-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 className="font-serif text-2xl text-ink mb-3">{t.doneTitle}</h2>
        <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">{t.doneText}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Language toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex rounded-xl border border-sand-200 bg-white overflow-hidden shadow-sm">
          <button
            onClick={() => setLocale("fr")}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${locale === "fr" ? "bg-terracotta text-white" : "text-muted hover:text-ink"}`}
          >
            🇫🇷 Français
          </button>
          <button
            onClick={() => setLocale("en")}
            className={`px-4 py-2 text-xs font-semibold transition-colors ${locale === "en" ? "bg-terracotta text-white" : "text-muted hover:text-ink"}`}
          >
            🇬🇧 English
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <span className="inline-block rounded-full bg-terracotta/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-terracotta mb-4">
          {t.badge}
        </span>
        <h1 className="font-serif text-2xl text-ink mb-2">{t.title}</h1>
        <p className="text-sm text-muted">{t.subtitle}</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex gap-1.5 mb-2">
          {t.steps.map((s, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-terracotta" : "bg-sand-200"}`} />
          ))}
        </div>
        <p className="text-[11px] text-muted">{locale === "fr" ? `Étape` : "Step"} {step + 1}/{t.steps.length} — <span className="font-medium text-ink/70">{t.steps[step]}</span></p>
      </div>

      <div className="rounded-2xl border border-sand-200 bg-white shadow-sm p-6 space-y-6">

        {/* ── STEP 1 ── */}
        {step === 0 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s1.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s1.q1}</label>
                <input value={form.riadName} onChange={e => set("riadName", e.target.value)} placeholder="Riad Al Baraka…" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-sand/20 focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s1.q2}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s1.cities.map(c => <Radio key={c} name="city" value={c} checked={form.city === c} onChange={() => set("city", c)} label={c} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s1.q3}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s1.rooms.map(r => <Radio key={r} name="roomCount" value={r} checked={form.roomCount === r} onChange={() => set("roomCount", r)} label={r} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s1.q4}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s1.years.map(y => <Radio key={y} name="yearsOpen" value={y} checked={form.yearsOpen === y} onChange={() => set("yearsOpen", y)} label={y} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 2 ── */}
        {step === 1 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s2.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s2.q5}</label>
                <div className="space-y-2">
                  {t.s2.methods.map(m => <Checkbox key={m} checked={form.bookingMethods.includes(m)} onChange={() => set("bookingMethods", toggle(form.bookingMethods, m))} label={m} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s2.q6}</label>
                <div className="space-y-2">
                  {t.s2.web.map(w => <Radio key={w} name="hasWebsite" value={w} checked={form.hasWebsite === w} onChange={() => set("hasWebsite", w)} label={w} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s2.q7}</label>
                <div className="space-y-2">
                  {t.s2.platforms.map(p => <Checkbox key={p} checked={form.platforms.includes(p)} onChange={() => set("platforms", toggle(form.platforms, p))} label={p} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s2.q8}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s2.direct.map(d => <Radio key={d} name="directPct" value={d} checked={form.directPct === d} onChange={() => set("directPct", d)} label={d} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s2.q9}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s2.occ.map(o => <Radio key={o} name="occupancyRate" value={o} checked={form.occupancyRate === o} onChange={() => set("occupancyRate", o)} label={o} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3 ── */}
        {step === 2 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s3.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">{t.s3.q10}</label>
                {form.challenges.length >= 3 && <p className="text-[11px] text-terracotta mb-2">{locale === "fr" ? "Maximum 3 sélectionnés" : "Maximum 3 selected"}</p>}
                <div className="space-y-2">
                  {t.s3.challenges.map(c => <Checkbox key={c} checked={form.challenges.includes(c)} onChange={() => set("challenges", toggle(form.challenges, c, 3))} label={c} disabled={form.challenges.length >= 3 && !form.challenges.includes(c)} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s3.q11}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s3.time.map(t2 => <Radio key={t2} name="adminTimeDay" value={t2} checked={form.adminTimeDay === t2} onChange={() => set("adminTimeDay", t2)} label={t2} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s3.q12}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s3.lost.map(l => <Radio key={l} name="lostBookings" value={l} checked={form.lostBookings === l} onChange={() => set("lostBookings", l)} label={l} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s3.q13}</label>
                <div className="space-y-2">
                  {t.s3.stress.map(s => <Radio key={s} name="biggestStress" value={s} checked={form.biggestStress === s} onChange={() => set("biggestStress", s)} label={s} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 4 ── */}
        {step === 3 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s4.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-1">{t.s4.q14}</label>
                {form.wantedFeatures.length >= 5 && <p className="text-[11px] text-terracotta mb-2">{locale === "fr" ? "Maximum 5 sélectionnées" : "Maximum 5 selected"}</p>}
                <div className="space-y-2">
                  {t.s4.features.map(f => <Checkbox key={f} checked={form.wantedFeatures.includes(f)} onChange={() => set("wantedFeatures", toggle(form.wantedFeatures, f, 5))} label={f} disabled={form.wantedFeatures.length >= 5 && !form.wantedFeatures.includes(f)} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s4.q15}</label>
                <div className="space-y-2">
                  {t.s4.tech.map(tc => <Radio key={tc} name="techComfort" value={tc} checked={form.techComfort === tc} onChange={() => set("techComfort", tc)} label={tc} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s4.q16}</label>
                <div className="space-y-2">
                  {t.s4.arabic.map(a => <Radio key={a} name="wantsArabic" value={a} checked={form.wantsArabic === a} onChange={() => set("wantsArabic", a)} label={a} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s4.q17}</label>
                <div className="space-y-2">
                  {t.s4.device.map(d => <Radio key={d} name="usesSmartphone" value={d} checked={form.usesSmartphone === d} onChange={() => set("usesSmartphone", d)} label={d} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 5 ── */}
        {step === 4 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s5.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s5.q18}</label>
                <div className="grid grid-cols-2 gap-2">
                  {t.s5.pays.map(p => <Radio key={p} name="currentlyPays" value={p} checked={form.currentlyPays === p} onChange={() => set("currentlyPays", p)} label={p} />)}
                </div>
              </div>
              {form.currentlyPays === t.s5.pays[0] && (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s5.q19}</label>
                  <input value={form.currentAmount} onChange={e => set("currentAmount", e.target.value)} placeholder="Ex : 150 MAD" className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-sand/20 focus:bg-white transition-all" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s5.q20}</label>
                <div className="space-y-2">
                  {t.s5.amounts.map(a => <Radio key={a} name="willingToPay" value={a} checked={form.willingToPay === a} onChange={() => set("willingToPay", a)} label={a} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s5.q21}</label>
                <div className="space-y-2">
                  {t.s5.pref.map(p => <Radio key={p} name="payPreference" value={p} checked={form.payPreference === p} onChange={() => set("payPreference", p)} label={p} />)}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s5.q22}</label>
                <div className="grid grid-cols-3 gap-2">
                  {t.s5.comm.map(c => <Radio key={c} name="commissionOk" value={c} checked={form.commissionOk === c} onChange={() => set("commissionOk", c)} label={c} />)}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 6 ── */}
        {step === 5 && (
          <>
            <h2 className="font-serif text-lg text-ink">{t.s6.title}</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s6.q23}</label>
                <div className="space-y-2">
                  {t.s6.demo.map(d => <Radio key={d} name="wantsDemo" value={d} checked={form.wantsDemo === (d === t.s6.demo[0])} onChange={() => set("wantsDemo", d === t.s6.demo[0])} label={d} />)}
                </div>
              </div>
              {form.wantsDemo && (
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s6.q24}</label>
                  <input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder={t.s6.placeholder24} className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-sand/20 focus:bg-white transition-all" />
                  <input value={form.contactWa} onChange={e => set("contactWa", e.target.value)} placeholder="+212 6XX XXX XXX" className="mt-2 w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-sand/20 focus:bg-white transition-all" />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wide mb-2">{t.s6.q25}</label>
                <textarea value={form.comments} onChange={e => set("comments", e.target.value)} placeholder={t.s6.placeholder25} rows={4} className="w-full rounded-xl border border-sand-200 px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-terracotta/30 bg-sand/20 focus:bg-white resize-none transition-all" />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6 gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(s => s - 1)} className="rounded-xl border border-sand-200 bg-white px-5 py-2.5 text-sm font-medium text-muted hover:text-ink transition-colors">
            {t.back}
          </button>
        ) : <div />}

        {step < 5 ? (
          <button
            onClick={() => canNext() && setStep(s => s + 1)}
            disabled={!canNext()}
            className="rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 disabled:opacity-40 transition-colors"
          >
            {t.next}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={pending}
            className="rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white hover:bg-terracotta/90 disabled:opacity-50 transition-colors"
          >
            {pending ? t.submitting : t.submit}
          </button>
        )}
      </div>
    </div>
  );
}
