"use client";

import { useEffect, useState } from "react";

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show once per session
    if (!sessionStorage.getItem("demo-banner-seen")) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    sessionStorage.setItem("demo-banner-seen", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-terracotta to-brass" />

        <div className="px-7 py-8 text-center space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-terracotta/10 px-3.5 py-1.5">
            <span className="h-2 w-2 rounded-full bg-terracotta animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-terracotta">
              Site de démonstration
            </span>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-ink leading-snug">
              Riad Dar Kader
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Ce site est une démo réalisée par{" "}
              <a
                href="https://mbndev.ma"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-terracotta hover:underline"
              >
                mbndev.ma
              </a>
              . Les réservations et informations présentées sont fictives.
            </p>
          </div>

          <div className="pt-1 space-y-2">
            <button
              onClick={dismiss}
              className="w-full rounded-xl bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-terracotta/90 transition-colors"
            >
              Compris, continuer
            </button>
            <a
              href="https://mbndev.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl border border-sand-200 px-5 py-2.5 text-sm font-medium text-muted hover:text-ink transition-colors"
            >
              Visiter mbndev.ma
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
