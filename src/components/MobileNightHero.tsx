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
      <div className="relative h-[51svh] min-h-[390px] max-h-[500px]">
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
          className="absolute bottom-12 right-7 max-w-[104px] text-right"
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
        className="relative -mt-8 rounded-t-[2.6rem] bg-[#18130f] px-5 pb-7 pt-8 shadow-[0_-14px_38px_rgba(0,0,0,0.34)]"
      >
        <p className="flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-[0.26em] text-[#d8b56a] before:h-px before:w-9 before:bg-[#d8b56a]/80 after:h-px after:w-9 after:bg-[#d8b56a]/80">
          Marrakech
        </p>
        <h2 className="mx-auto mt-4 max-w-[335px] whitespace-pre-line text-center font-serif text-[2.55rem] leading-[0.92] tracking-[-0.035em] text-white">
          {fr ? "Votre séjour\ncommence ici" : "Your stay\nbegins here"}
        </h2>
        <p className="mt-4 text-center font-serif text-lg leading-relaxed text-white/70">
          {fr
            ? "L’authenticité marocaine, le luxe tout en douceur."
            : "Moroccan authenticity, gentle luxury."}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.055] p-2">
          <div className="grid grid-cols-2">
            <Link href={stayHref} className="group border-r border-white/20 px-3 py-3 transition-colors active:bg-white/10">
              <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                <IconCalendar size={17} /> {fr ? "Arrivée" : "Arrival"}
              </span>
              <span className="mt-1 flex items-center justify-between font-serif text-xl text-white">
                {fr ? "12 oct. 2026" : "Oct 12, 2026"} <IconChevronDown size={15} className="text-white/70" />
              </span>
            </Link>
            <Link href={stayHref} className="group px-3 py-3 transition-colors active:bg-white/10">
              <span className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/60">
                <IconCalendar size={17} /> {fr ? "Départ" : "Departure"}
              </span>
              <span className="mt-1 flex items-center justify-between font-serif text-xl text-white">
                {fr ? "15 oct. 2026" : "Oct 15, 2026"} <IconChevronDown size={15} className="text-white/70" />
              </span>
            </Link>
          </div>
          <Link href={stayHref} className="mt-2 flex min-h-[58px] items-center justify-center gap-3 rounded-2xl bg-[#bd5a40] px-5 font-serif text-[1.2rem] text-white shadow-[0_10px_28px_rgba(189,90,64,0.28)] transition-transform active:scale-[0.98]">
            <span>{fr ? "Vérifier les disponibilités" : "Check availability"}</span>
            <IconArrowRight size={19} />
          </Link>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-center font-serif text-base text-white/70">
          <IconShield size={19} className="text-[#e8d6b9]" />
          {fr ? "Réservation directe · sans commission" : "Direct booking · no commission"}
        </p>
        <p className="mt-8 flex items-center justify-center gap-3 text-center text-[10px] font-medium uppercase tracking-[0.2em] leading-relaxed text-[#d8b56a]/85 before:h-px before:w-8 before:bg-[#d8b56a]/70 after:h-px after:w-8 after:bg-[#d8b56a]/70">
          {fr ? "Plus qu’un hébergement, une expérience marocaine" : "More than a stay, a Moroccan experience"}
        </p>
      </motion.div>
    </section>
  );
}
