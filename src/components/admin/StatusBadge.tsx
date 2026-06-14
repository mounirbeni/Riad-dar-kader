const STYLES: Record<string, { label: string; dot: string; cls: string }> = {
  pending:   { label: "En attente", dot: "bg-amber-500",  cls: "bg-amber-50 text-amber-800 border border-amber-200" },
  confirmed: { label: "Confirmée",  dot: "bg-green-500",  cls: "bg-green-50 text-green-800 border border-green-200" },
  cancelled: { label: "Annulée",    dot: "bg-red-500",    cls: "bg-red-50 text-red-700 border border-red-200" },
  completed: { label: "Terminée",   dot: "bg-sand-400",   cls: "bg-sand-100 text-ink/60 border border-sand-300" },
};

export function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const s = STYLES[status] || STYLES.pending;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium ${s.cls} ${
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className={`inline-block rounded-full ${s.dot} ${large ? "h-2 w-2" : "h-1.5 w-1.5"}`} />
      {s.label}
    </span>
  );
}
