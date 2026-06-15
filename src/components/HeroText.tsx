"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export function HeroText({
  kicker,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  secondaryLabel,
  secondaryHref,
  openingNote,
  directLabel,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  openingNote: string;
  directLabel: string;
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="container-page relative flex min-h-[82vh] flex-col items-start justify-center py-20 text-white xl:min-h-0 xl:max-w-none xl:mx-0 xl:px-14 xl:py-0"
    >
      <motion.div variants={item} className="flex items-center gap-3">
        <span className="h-px w-8 bg-brass-light" />
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-brass-light">
          {kicker}
        </span>
      </motion.div>
      <motion.h1
        variants={item}
        className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl md:text-[5.5rem] xl:max-w-lg xl:text-[4.75rem]"
      >
        {title}
      </motion.h1>
      <motion.p
        variants={item}
        className="mt-6 max-w-xl text-lg leading-relaxed text-white/90 xl:max-w-sm"
      >
        {subtitle}
      </motion.p>
      <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
        <Link href={ctaHref} className="btn-primary shadow-soft">
          {ctaLabel}
        </Link>
        <Link
          href={secondaryHref}
          className="btn border border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
        >
          {secondaryLabel}
        </Link>
      </motion.div>
      <motion.div
        variants={item}
        className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-brass/90 px-4 py-2 text-sm font-medium text-white">
          <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
          {openingNote}
        </span>
        <span className="text-sm text-white/75">{directLabel}</span>
      </motion.div>
    </motion.div>
  );
}
