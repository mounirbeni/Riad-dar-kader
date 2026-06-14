// Elegant Moroccan-flavoured placeholder visual used until real photos arrive.
// Pure SVG/CSS — no network requests.

type PlaceholderProps = {
  label?: string;
  variant?: number; // 0..n to vary the gradient
  className?: string;
  rounded?: boolean;
};

const GRADIENTS = [
  ["#8B3A2A", "#A8513F"],
  ["#B8943F", "#977829"],
  ["#6E2B1F", "#8B3A2A"],
  ["#A8513F", "#B8943F"],
  ["#7A6A58", "#8B3A2A"],
  ["#977829", "#6E2B1F"],
  ["#8B3A2A", "#B8943F"],
];

export function Placeholder({
  label,
  variant = 0,
  className = "",
  rounded = true,
}: PlaceholderProps) {
  const [from, to] = GRADIENTS[variant % GRADIENTS.length];
  const gid = `g${variant}-${Math.abs(hash(label || "rdk") % 9999)}`;
  return (
    <div
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      aria-hidden={!label}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 400 300"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="55%" stopColor={to} />
            <stop offset="100%" stopColor={from} />
          </linearGradient>
          <radialGradient id={`v-${gid}`} cx="50%" cy="38%" r="75%">
            <stop offset="55%" stopColor="#000000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
          </radialGradient>
          <pattern
            id={`p-${gid}`}
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M14 0l14 14-14 14L0 14z" fill="none" stroke="#F5F0E8" strokeWidth="0.6" opacity="0.16" />
            <circle cx="14" cy="14" r="1" fill="#F5F0E8" opacity="0.14" />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${gid})`} />
        <rect width="400" height="300" fill={`url(#p-${gid})`} />
        {/* Moroccan keyhole arch silhouette */}
        <path
          d="M165 235 V150 C165 120 178 100 200 100 C222 100 235 120 235 150 V235 Z"
          fill="#F5F0E8"
          opacity="0.10"
        />
        <rect width="400" height="300" fill={`url(#v-${gid})`} />
      </svg>
      {label && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="rounded-full bg-black/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/90 backdrop-blur-sm">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return h;
}
