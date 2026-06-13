import type { Dictionary } from "@/i18n/dictionaries";

export function Stepper({
  step,
  dict,
}: {
  step: number;
  dict: Dictionary;
}) {
  const labels = [
    dict.stay.step1,
    dict.stay.step2,
    dict.stay.step3,
    dict.stay.step4,
    dict.stay.step5,
  ];
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs sm:gap-3">
      {labels.map((label, i) => {
        const n = i + 1;
        const active = step === n;
        const done = step > n;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition ${
                active
                  ? "bg-terracotta text-white"
                  : done
                    ? "bg-brass text-white"
                    : "bg-sand-300 text-muted"
              }`}
            >
              {done ? "✓" : n}
            </span>
            <span
              className={`hidden sm:inline ${
                active ? "font-medium text-ink" : "text-muted"
              }`}
            >
              {label}
            </span>
            {n < labels.length && (
              <span className="hidden h-px w-6 bg-sand-300 sm:inline-block" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
