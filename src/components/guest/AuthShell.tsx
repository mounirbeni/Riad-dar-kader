import Link from "next/link";

function GeometricPattern() {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="rdk-geo" x="0" y="0" width="56" height="56" patternUnits="userSpaceOnUse">
          <path d="M28 0 L56 28 L28 56 L0 28 Z" fill="none" stroke="white" strokeWidth="0.7" />
          <path d="M0 0 L28 28 M56 0 L28 28 M0 56 L28 28 M56 56 L28 28" stroke="white" strokeWidth="0.35" />
          <circle cx="28" cy="28" r="2.5" fill="none" stroke="white" strokeWidth="0.6" />
          <circle cx="28" cy="0"  r="1.2" fill="white" />
          <circle cx="28" cy="56" r="1.2" fill="white" />
          <circle cx="0"  cy="28" r="1.2" fill="white" />
          <circle cx="56" cy="28" r="1.2" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rdk-geo)" />
    </svg>
  );
}

export function AuthShell({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const fr = locale !== "en";

  return (
    <div className="flex min-h-[80vh]">

      {/* ── Left decorative panel (lg+) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[40%] shrink-0 relative bg-terracotta flex-col justify-between px-12 py-14 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <GeometricPattern />
        </div>

        {/* Top badge */}
        <div className="relative z-10">
          <Link
            href={`/${locale}`}
            className="group inline-flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 transition group-hover:bg-white/30">
              <span className="font-serif text-[17px] text-white">R</span>
            </div>
            <span className="text-sm font-medium text-white/80 transition group-hover:text-white">
              Mbn Riad
            </span>
          </Link>
        </div>

        {/* Centre ornament */}
        <div className="relative z-10 flex justify-center">
          <svg
            width="88"
            height="88"
            viewBox="0 0 100 100"
            className="opacity-20"
            aria-hidden="true"
          >
            <polygon
              points="50,4 61,35 95,35 68,57 79,91 50,69 21,91 32,57 5,35 39,35"
              fill="white"
            />
          </svg>
        </div>

        {/* Bottom text */}
        <div className="relative z-10">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45 mb-4">
            {fr ? "Médina de Marrakech · Maroc" : "Medina, Marrakech · Morocco"}
          </p>
          <h2 className="font-serif text-[2.6rem] xl:text-5xl leading-[1.1] text-white">
            Mbn<br />Riad
          </h2>
          <p className="mt-4 max-w-[240px] text-sm leading-relaxed text-white/60">
            {fr
              ? "Un riad traditionnel au cœur de la Médina, pour des séjours d'exception."
              : "A traditional riad in the heart of the Medina, for an exceptional stay."}
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px w-8 bg-white/25" />
            <span className="text-[10px] uppercase tracking-widest text-white/35">
              {fr ? "Réservation directe" : "Direct booking"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Right form panel ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 bg-[#FDFAF7]">

        {/* Mobile brand strip */}
        <div className="lg:hidden mb-8 w-full max-w-[420px]">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-terracotta/10">
              <span className="font-serif text-base text-terracotta">R</span>
            </div>
            <span className="text-sm font-medium text-ink">Mbn Riad</span>
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {children}
        </div>

        {/* Back to site */}
        <div className="mt-10 w-full max-w-[420px]">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-terracotta"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {fr ? "Retour au site" : "Back to site"}
          </Link>
        </div>
      </div>
    </div>
  );
}
