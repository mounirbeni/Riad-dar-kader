"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { IconArrowRight, IconCalendar, IconChevronDown, IconShield } from "@/components/Icons";

type Props = {
  locale: Locale;
  stayHref: string;
};

export function MobileNightHero({ locale, stayHref }: Props) {
  const fr = locale === "fr";

  return (
    <section className="relative overflow-hidden bg-[#18130f] text-white xl:hidden">
      <div className="relative h-[49svh] min-h-[360px] max-h-[430px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/riad/hero-night-arrival.webp"
          alt={fr ? "Entrée illuminée de MBN DEMO RIAD" : "Illuminated entrance of MBN DEMO RIAD"}
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/30" />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute bottom-10 right-7 max-w-[104px] text-right"
        >
          <div className="text-[10px] font-medium uppercase leading-[1.95] tracking-[0.19em] text-white/75">
            {fr ? "Un autre rythme à Marrakech" : "Another rhythm in Marrakech"}
          </div>
          <span className="ml-auto mt-3 block h-px w-8 bg-[#d8b56a]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        className="relative -mt-7 overflow-hidden rounded-t-[2.6rem] border-t border-white/20 bg-[#1b1513]/78 px-5 pb-5 pt-5 shadow-[0_-18px_48px_rgba(0,0,0,0.46)] backdrop-blur-[28px]"
      >
        <div aria-hidden className="absolute -inset-8 bg-[url('/images/riad/hero-night-arrival.webp')] bg-cover bg-center opacity-20 blur-[18px]" />
        <div aria-hidden className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,242,218,0.13),transparent_40%,rgba(12,9,8,0.42))]" />
        <div className="relative z-10">
          <p className="flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-[0.26em] text-[#efd07f] before:h-px before:w-9 before:bg-[#efd07f]/80 after:h-px after:w-9 after:bg-[#efd07f]/80">
            Marrakech
          </p>
          <h2 className="mx-auto mt-3 max-w-[335px] whitespace-pre-line text-center font-serif text-[2.25rem] leading-[0.9] tracking-[-0.035em] text-white">
            {fr ? "Votre séjour\ncommence ici" : "Your stay\nbegins here"}
          </h2>
          <p className="mt-3 text-center font-serif text-base leading-relaxed text-white/80">
            {fr
              ? "L’authenticité marocaine, le luxe tout en douceur."
              : "Moroccan authenticity, gentle luxury."}
          </p>

          <div className="relative mt-4 overflow-hidden rounded-2xl border border-[#f4dfbd]/35 bg-[#130e0c]/86 p-1.5 shadow-[inset_0_1px_0_rgba(255,244,222,0.22),0_14px_30px_rgba(0,0,0,0.32)] backdrop-blur-2xl before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/40">
            <div className="grid grid-cols-2">
              <Link href={stayHref} className="group border-r border-white/20 px-3 py-2.5 transition-colors active:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f0d8b7]">
                  <IconCalendar size={17} /> {fr ? "Arrivée" : "Arrival"}
                </span>
                <span className="mt-1 flex items-center justify-between font-serif text-lg text-[#fff9ef]">
                  {fr ? "12 oct. 2026" : "Oct 12, 2026"} <IconChevronDown size={15} className="text-[#f0d8b7]" />
                </span>
              </Link>
              <Link href={stayHref} className="group px-3 py-2.5 transition-colors active:bg-white/10">
                <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f0d8b7]">
                  <IconCalendar size={17} /> {fr ? "Départ" : "Departure"}
                </span>
                <span className="mt-1 flex items-center justify-between font-serif text-lg text-[#fff9ef]">
                  {fr ? "15 oct. 2026" : "Oct 15, 2026"} <IconChevronDown size={15} className="text-[#f0d8b7]" />
                </span>
              </Link>
            </div>
            <Link href={stayHref} className="mt-1.5 flex min-h-[50px] items-center justify-center gap-3 rounded-2xl border border-[#ffc8a9]/30 bg-[#c76346]/90 px-5 font-serif text-lg text-white shadow-[inset_0_1px_0_rgba(255,238,218,0.28),0_10px_28px_rgba(189,90,64,0.38)] transition-transform active:scale-[0.98]">
              <span>{fr ? "Vérifier les disponibilités" : "Check availability"}</span>
              <IconArrowRight size={19} />
            </Link>
          </div>

          <p className="mt-3 flex items-center justify-center gap-2 text-center font-serif text-sm text-white/80">
            <IconShield size={17} className="text-[#f0d8b7]" />
            {fr ? "Réservation directe · sans commission" : "Direct booking · no commission"}
          </p>
          <p className="mt-5 flex items-center justify-center gap-3 text-center text-[9px] font-medium uppercase tracking-[0.2em] leading-relaxed text-[#efd07f]/90 before:h-px before:w-8 before:bg-[#efd07f]/70 after:h-px after:w-8 after:bg-[#efd07f]/70">
            {fr ? "Plus qu’un hébergement, une expérience marocaine" : "More than a stay, a Moroccan experience"}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
