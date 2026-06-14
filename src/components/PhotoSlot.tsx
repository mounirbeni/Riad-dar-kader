// A clearly-marked "photo needed" placeholder. Renders the Moroccan
// Placeholder visual behind a dashed overlay that names the photo, its
// recommended aspect ratio and an optional slot code — so the owner can
// see exactly where (and how many) real photos are required.

import { Placeholder } from "@/components/Placeholder";
import { IconCamera } from "@/components/Icons";

type PhotoSlotProps = {
  /** What the photo should show, e.g. "Patio central". */
  label: string;
  /** Recommended aspect ratio hint, e.g. "16:9", "4:3", "1:1", "3:4". */
  ratio?: string;
  /** Optional short slot code, e.g. "H1", "R-mouassine-2". */
  code?: string;
  variant?: number;
  rounded?: boolean;
  className?: string;
};

export function PhotoSlot({
  label,
  ratio,
  code,
  variant = 0,
  rounded = true,
  className = "",
}: PhotoSlotProps) {
  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      role="img"
      aria-label={`Emplacement photo : ${label}`}
    >
      <Placeholder variant={variant} rounded={false} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 bg-ink/35" />
      {/* dashed frame */}
      <div className="absolute inset-2 rounded-xl border-2 border-dashed border-white/60" />
      {code && (
        <span className="absolute left-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-bold tracking-wide text-terracotta">
          {code}
        </span>
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
          <IconCamera size={20} />
        </span>
        <span className="max-w-[90%] text-sm font-medium leading-tight">{label}</span>
        <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/80">
          <span className="rounded-full bg-black/30 px-2 py-0.5">Photo à fournir</span>
          {ratio && <span className="rounded-full bg-black/30 px-2 py-0.5">{ratio}</span>}
        </span>
      </div>
    </div>
  );
}
