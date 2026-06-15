"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { IconStar } from "@/components/Icons";

type Review = {
  readonly name: string;
  readonly origin: string;
  readonly text: string;
  readonly platform: "google" | "tripadvisor";
};

export function TestimonialsCarousel({
  reviews,
  title,
}: {
  reviews: readonly Review[];
  title: string;
}) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pagesRef = useRef(0);

  useEffect(() => {
    function measure() {
      const w = window.innerWidth;
      setPerPage(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const totalPages = Math.ceil(reviews.length / perPage);
  pagesRef.current = totalPages;

  // Clamp page when perPage changes
  useEffect(() => {
    setPage((p) => Math.min(p, Math.ceil(reviews.length / perPage) - 1));
  }, [perPage, reviews.length]);

  const advance = useCallback(() => {
    setPage((p) => (p + 1) % pagesRef.current);
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(advance, 5000);
  }, [advance]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  function goTo(p: number) {
    setPage(p);
    startTimer();
  }

  const start = page * perPage;
  const visible = reviews.slice(start, start + perPage);

  return (
    <section className="bg-white py-20">
      <div className="container-page">
        {/* Title + platform labels */}
        <div className="text-center">
          <h2 className="font-serif text-3xl text-ink sm:text-4xl">{title}</h2>
          <div className="mt-4 flex items-center justify-center gap-6">
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <GoogleIcon />
              Google Maps
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <TripAdvisorIcon />
              TripAdvisor
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((r, i) => (
            <div
              key={`${page}-${i}`}
              className="card flex flex-col gap-4 p-7 transition-opacity duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <IconStar key={s} size={13} className="fill-brass stroke-brass" />
                  ))}
                </div>
                <span className="flex items-center gap-1.5">
                  {r.platform === "google" ? <GoogleIcon /> : <TripAdvisorIcon />}
                  <span className="text-[11px] text-muted">
                    {r.platform === "google" ? "Google" : "TripAdvisor"}
                  </span>
                </span>
              </div>
              <p className="flex-1 text-sm italic leading-relaxed text-muted">
                &ldquo;{r.text}&rdquo;
              </p>
              <div>
                <p className="text-sm font-medium text-ink">{r.name}</p>
                <p className="text-xs text-muted">{r.origin}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-center gap-5">
          <button
            onClick={() => goTo((page - 1 + totalPages) % totalPages)}
            aria-label="Previous"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 bg-white text-muted transition hover:border-terracotta hover:text-terracotta"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Page ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === page
                    ? "w-6 bg-terracotta"
                    : "w-2 bg-sand-200 hover:bg-terracotta/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo((page + 1) % totalPages)}
            aria-label="Next"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-sand-200 bg-white text-muted transition hover:border-terracotta hover:text-terracotta"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-label="Google" role="img">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function TripAdvisorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 100 100" aria-label="TripAdvisor" role="img">
      <circle cx="50" cy="50" r="48" fill="#34E0A1" />
      <ellipse cx="35" cy="52" rx="13" ry="13" fill="white" />
      <ellipse cx="65" cy="52" rx="13" ry="13" fill="white" />
      <circle cx="35" cy="52" r="6.5" fill="black" />
      <circle cx="65" cy="52" r="6.5" fill="black" />
      <circle cx="37" cy="49" r="2.5" fill="white" />
      <circle cx="67" cy="49" r="2.5" fill="white" />
    </svg>
  );
}
