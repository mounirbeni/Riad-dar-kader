"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";

const SESSION_KEY = "demo-banner-seen";

const messages = {
  fr: {
    eyebrow: "UNE EXPÉRIENCE SIGNÉE MBN DEV",
    heading: "Bienvenue à Riad Dar Kader",
    intro: "Ce site web est propulsé par MBN DEV.",
    disclaimer: "Site de démonstration : les réservations et les informations présentées sont fictives.",
    continue: "Découvrir le riad",
    visit: "Découvrir MBN DEV",
    close: "Fermer cette notification",
    label: "Présentation du site",
  },
  en: {
    eyebrow: "AN EXPERIENCE BY MBN DEV",
    heading: "Welcome to Riad Dar Kader",
    intro: "This website is powered by MBN DEV.",
    disclaimer: "Demonstration website: reservations and information shown are fictional.",
    continue: "Explore the riad",
    visit: "Discover MBN DEV",
    close: "Close this notification",
    label: "Website introduction",
  },
} as const;

/** Guest-facing introduction only; existing session key avoids surprising repeat popups. */
export function DemoBanner({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const copy = messages[locale];

  const dismiss = useCallback(() => {
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Browsers that restrict storage can still dismiss this introduction.
    }
    setVisible(false);
  }, []);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      // Continue without session persistence if storage is unavailable.
    }
    const timer = window.setTimeout(() => setVisible(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;
      const elements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!elements.length) return;
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [visible, dismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center overflow-y-auto px-4 py-6"
          style={{ paddingTop: "max(24px, env(safe-area-inset-top))", paddingBottom: "max(24px, env(safe-area-inset-bottom))" }}
        >
          <motion.button
            type="button"
            tabIndex={-1}
            aria-label={copy.close}
            className="fixed inset-0 cursor-default border-0 bg-[#080504]/75 backdrop-blur-md"
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.25 }}
            onClick={dismiss}
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={copy.label}
            aria-labelledby="riad-powered-title"
            aria-describedby="riad-powered-description"
            className="relative my-auto w-full max-w-[410px] overflow-hidden rounded-[30px] border border-[#e8d6b9]/30 text-center text-[#f6eee1]"
            style={{
              background: "linear-gradient(145deg, rgba(111, 65, 44, .89), rgba(49, 30, 23, .95) 48%, rgba(23, 16, 14, .96))",
              backdropFilter: "blur(38px) saturate(175%)",
              WebkitBackdropFilter: "blur(38px) saturate(175%)",
              boxShadow: "inset 0 1px 0 rgba(255,245,219,.30), 0 36px 95px rgba(0,0,0,.65), 0 0 66px rgba(189,90,64,.18)",
            }}
            initial={reducedMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.43, ease: [0.16, 1, 0.3, 1] }}
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#f6e5bb]/90 to-transparent" />
            <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#d8b56a]/15 blur-[70px]" />
            <button
              ref={closeRef}
              type="button"
              onClick={dismiss}
              aria-label={copy.close}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#f6eee1]/15 bg-[#f6eee1]/[0.06] text-xl text-[#f6eee1]/80 transition hover:bg-[#f6eee1]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8b56a]"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="relative px-6 pb-7 pt-12 sm:px-9 sm:pb-9">
              <Image
                src="/brand/riad-dar-kader-logo.svg"
                alt="Riad Dar Kader"
                width={270}
                height={67}
                unoptimized
                className="mx-auto mb-7 h-auto w-[220px] max-w-full object-contain sm:w-[254px]"
              />
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d8b56a]/35 bg-[#d8b56a]/10 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#f2dcab]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#d8b56a] shadow-[0_0_10px_#d8b56a]" />
                {copy.eyebrow}
              </span>
              <h2 id="riad-powered-title" className="mb-3 font-serif text-[30px] leading-[1.08] tracking-tight text-[#fff5dd] sm:text-[34px]">
                {copy.heading}
              </h2>
              <p id="riad-powered-description" className="mx-auto max-w-[290px] text-sm leading-relaxed text-[#f6eee1]/85">
                {copy.intro}
              </p>
              <p className="mx-auto mt-3 max-w-[300px] text-xs leading-relaxed text-[#e8d6b9]/70">
                {copy.disclaimer}
              </p>
              <div className="mt-7 space-y-3">
                <button
                  type="button"
                  onClick={dismiss}
                  className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#ffe6b5]/50 bg-gradient-to-br from-[#e0b875] via-[#bd8c50] to-[#8e5c34] px-5 py-3 text-sm font-semibold text-[#21150f] shadow-[inset_0_1px_0_rgba(255,249,226,.55),0_12px_28px_rgba(0,0,0,.2)] transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6e5bb]"
                >
                  {copy.continue}
                </button>
                <a
                  href="https://mbndev.ma"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-12 w-full items-center justify-center rounded-2xl border border-[#f6eee1]/20 bg-[#f6eee1]/[0.06] px-5 py-3 text-sm font-medium text-[#f6eee1] transition hover:bg-[#f6eee1]/[0.13] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d8b56a]"
                >
                  {copy.visit} <span aria-hidden="true" className="ml-2">↗</span>
                </a>
              </div>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#e8d6b9]/60">
                Powered by <span className="text-[#f3d69a]">MBN DEV</span>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
