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
            <stop offset="100%" stopColor={to} />
          </linearGradient>
          <pattern
            id={`p-${gid}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <path
              d="M20 0l20 20-20 20L0 20z"
              fill="none"
              stroke="#F5F0E8"
              strokeWidth="0.8"
              opacity="0.18"
            />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${gid})`} />
        <rect width="400" height="300" fill={`url(#p-${gid})`} />
        {/* Moroccan arch silhouette */}
        <path
          d="M170 230 V150 C170 120 185 105 200 105 C215 105 230 120 230 150 V230 Z"
          fill="#F5F0E8"
          opacity="0.12"
        />
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
