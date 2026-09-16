"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Locale } from "@/i18n/config";
import { IconArrowRight, IconCalendar, IconMapPin } from "@/components/Icons";

type Props = {
  locale: Locale;
  stayHref: string;
};

export function MobileNightHero({ locale, stayHref }: Props) {
  const fr = locale === "fr";

  return (
    <section className="relative overflow-hidden bg-[#18130f] text-white xl:hidden">
      <div className="relative h-[43svh] min-h-[320px] max-h-[430px]">
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
          className="absolute inset-x-5 bottom-10"
        >
          <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.23em] text-[#d8b56a]">
            <span className="h-px w-7 bg-[#d8b56a]" />
            {fr ? "Médina de Marrakech" : "Marrakech Medina"}
          </div>
          <h1 className="max-w-[280px] font-serif text-[2.5rem] leading-[0.88] tracking-[-0.035em] text-white">
            MBN DEMO RIAD
          </h1>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        className="relative -mt-7 rounded-t-[2rem] bg-[#18130f] px-5 pb-9 pt-7 shadow-[0_-12px_35px_rgba(0,0,0,0.24)]"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d8b56a]">
          {fr ? "Un refuge après la médina" : "A retreat beyond the medina"}
        </p>
        <h2 className="mt-2 font-serif text-[2rem] leading-none text-white">
          {fr ? "Votre séjour commence ici." : "Your stay begins here."}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
          {fr
            ? "Choisissez vos dates et découvrez le calme d’un riad marocain, au cœur de Marrakech."
            : "Choose your dates and discover the calm of a Moroccan riad in the heart of Marrakech."}
        </p>

        <div className="mt-6 grid grid-cols-2 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.06]">
          <Link href={stayHref} className="group border-r border-white/15 px-4 py-3.5 transition-colors active:bg-white/10">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <IconCalendar size={14} /> {fr ? "Arrivée" : "Arrival"}
            </span>
            <span className="mt-1 block text-sm font-medium text-white">
              {fr ? "Choisir une date" : "Choose a date"}
            </span>
          </Link>
          <Link href={stayHref} className="group px-4 py-3.5 transition-colors active:bg-white/10">
            <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              <IconCalendar size={14} /> {fr ? "Départ" : "Departure"}
            </span>
            <span className="mt-1 block text-sm font-medium text-white">
              {fr ? "Choisir une date" : "Choose a date"}
            </span>
          </Link>
        </div>

        <Link href={stayHref} className="mt-3 flex min-h-14 items-center justify-between rounded-2xl bg-[#b74f35] px-5 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(183,79,53,0.28)] transition-transform active:scale-[0.98]">
          <span>{fr ? "Vérifier les disponibilités" : "Check availability"}</span>
          <IconArrowRight size={19} />
        </Link>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-white/50">
          <IconMapPin size={14} className="text-[#d8b56a]" />
          {fr ? "Réservation directe · sans frais de plateforme" : "Direct booking · no platform fees"}
        </p>
      </motion.div>
    </section>
  );
}
