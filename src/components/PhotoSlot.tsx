// Project photography is selected by semantic slot so a page never falls back
// to a decorative placeholder while the booking system is waiting for uploaded
// owner photos.

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
  code,
  variant = 0,
  rounded = true,
  className = "",
}: PhotoSlotProps) {
  const src = imageForSlot(code, variant);

  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      role="img"
      aria-label={label}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-full w-full object-cover" />
    </div>
  );
}

function imageForSlot(code: string | undefined, variant: number): string {
  if (code?.startsWith("mouassine")) return "/images/riad/mouassine.webp";
  if (code?.startsWith("saadienne")) return "/images/riad/saadienne.webp";
  if (code?.startsWith("bahia")) return "/images/riad/bahia.webp";
  if (code?.startsWith("koutoubia")) return "/images/riad/koutoubia.webp";
  if (code?.startsWith("medina")) return "/images/riad/medina-suite.webp";
  if (code?.startsWith("patio")) return "/images/riad/patio-suite.webp";
  if (code?.startsWith("terrasse")) return "/images/riad/terrasse-suite.webp";

  const byCode: Record<string, string> = {
    H1: "/images/riad/patio.webp",
    H2: "/images/riad/patio.webp",
    LR1: "/images/riad/patio.webp",
    LR2: "/images/riad/patio.webp",
    LR3: "/images/riad/medina-lane.webp",
    E1: "/images/riad/medina-lane.webp",
    E2: "/images/riad/breakfast.webp",
    E3: "/images/riad/dinner.webp",
    E4: "/images/riad/medina-lane.webp",
    E5: "/images/riad/hammam.webp",
    E6: "/images/riad/dinner.webp",
    E7: "/images/riad/dinner.webp",
    E8: "/images/riad/breakfast.webp",
    E9: "/images/riad/patio.webp",
    E10: "/images/riad/patio.webp",
  };
  if (code && byCode[code]) return byCode[code];

  const gallery = [
    "/images/riad/patio.webp",
    "/images/riad/terrasse-suite.webp",
    "/images/riad/mouassine.webp",
    "/images/riad/medina-lane.webp",
    "/images/riad/breakfast.webp",
    "/images/riad/dinner.webp",
    "/images/riad/hammam.webp",
    "/images/riad/patio-suite.webp",
  ];
  return gallery[variant % gallery.length];
}
