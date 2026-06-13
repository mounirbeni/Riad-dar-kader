const STYLES: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Confirmée", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", cls: "bg-red-100 text-red-700" },
  completed: { label: "Terminée", cls: "bg-sand-300 text-ink/70" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] || STYLES.pending;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
