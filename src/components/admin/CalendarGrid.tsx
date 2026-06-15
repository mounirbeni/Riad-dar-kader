"use client";

import { useState, useRef, useEffect, useTransition, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingCell, CellKind } from "./OccupancyGrid";
import { checkInGuestAction, checkOutGuestAction } from "@/app/actions/admin";
import {
  IconUsers,
  IconMoon,
  IconLogIn,
  IconLogOut,
  IconArrowRight,
  IconX,
  IconCheck,
  IconCalendar,
  IconUser,
} from "@/components/Icons";

type RoomMeta = { id: string; name: string };

type Props = {
  rooms: RoomMeta[];
  dateStrs: string[];
  grid: Record<string, Record<string, CellKind>>;
  bookings: Record<string, BookingCell>;
  todayStr: string;
};

type StatusKey = "pending" | "confirmed" | "checkedIn" | "completed";

const STATUS: Record<StatusKey, { bar: string; text: string; label: string }> = {
  pending:   { bar: "bg-amber-400",   text: "text-amber-900",   label: "En attente" },
  confirmed: { bar: "bg-terracotta",  text: "text-white",       label: "Confirmée" },
  checkedIn: { bar: "bg-emerald-500", text: "text-white",       label: "Arrivé(e)" },
  completed: { bar: "bg-slate-400",   text: "text-slate-900",   label: "Terminée" },
};

function statusKey(cell: Extract<CellKind, { type: "booking" }>): StatusKey {
  if (cell.checkedIn) return "checkedIn";
  if (cell.status === "completed") return "completed";
  if (cell.status === "confirmed") return "confirmed";
  return "pending";
}

function fmtDate(dateStr: string, short = false) {
  const d = new Date(dateStr + "T12:00:00Z");
  if (short) return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function fmtDay(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00Z");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

// ─── Popup ────────────────────────────────────────────────────────────────────

type PopupState = {
  bookingId: string;
  anchorRect: DOMRect;
};

function BookingPopup({
  booking,
  onClose,
  anchorRect,
}: {
  booking: BookingCell;
  onClose: () => void;
  anchorRect: DOMRect;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionDone, setActionDone] = useState<string | null>(null);

  // Position popup fixed relative to viewport
  const popupStyle: CSSProperties = (() => {
    const POPUP_W = 440;
    const POPUP_H = 300;
    const GAP = 8;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    let top = anchorRect.bottom + GAP;
    let left = anchorRect.left;

    // Keep inside viewport horizontally
    if (left + POPUP_W > vpW - 12) left = vpW - POPUP_W - 12;
    if (left < 12) left = 12;

    // Flip above if not enough room below
    if (anchorRect.bottom + POPUP_H + GAP > vpH) {
      top = anchorRect.top - POPUP_H - GAP;
    }

    return { position: "fixed", top, left, width: POPUP_W, zIndex: 9999 };
  })();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const sk = booking.checkedIn
    ? "checkedIn"
    : booking.status === "completed"
    ? "completed"
    : booking.status === "confirmed"
    ? "confirmed"
    : ("pending" as StatusKey);
  const s = STATUS[sk];

  function doCheckIn() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", booking.id);
      const res = await checkInGuestAction({ ok: false }, fd);
      if (res.ok) {
        setActionDone("checkin");
        setTimeout(() => { onClose(); router.refresh(); }, 800);
      }
    });
  }

  function doCheckOut() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", booking.id);
      const res = await checkOutGuestAction({ ok: false }, fd);
      if (res.ok) {
        setActionDone("checkout");
        setTimeout(() => { onClose(); router.refresh(); }, 800);
      }
    });
  }

  const popupNode = (
    <div ref={ref} style={popupStyle} className="pointer-events-auto">
      <div className="rounded-2xl border border-sand-200 bg-white shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className={`${s.bar} px-4 py-3 flex items-center justify-between`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-xs font-bold uppercase tracking-widest opacity-80 ${s.text}`}>{s.label}</span>
            <span className={`font-mono text-sm font-bold ${s.text}`}>{booking.reference}</span>
          </div>
          <button
            onClick={onClose}
            className={`shrink-0 rounded-lg p-1 transition hover:bg-black/10 ${s.text}`}
          >
            <IconX size={14} />
          </button>
        </div>

        {/* Body: two columns */}
        <div className="grid grid-cols-2 gap-0 divide-x divide-sand-100">
          {/* Left: booking details */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <IconUser size={14} className="text-muted shrink-0" />
              <span className="font-semibold text-ink text-sm truncate">{booking.guestName}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCalendar size={14} className="text-muted shrink-0" />
              <span className="text-xs text-muted">
                {fmtDate(booking.checkIn, true)} → {fmtDate(booking.checkOut, true)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <IconMoon size={14} className="text-muted shrink-0" />
              <span className="text-xs text-muted">{booking.nights} nuit{booking.nights !== 1 ? "s" : ""}</span>
              <IconUsers size={14} className="text-muted shrink-0 ml-2" />
              <span className="text-xs text-muted">{booking.guests} voyageur{booking.guests !== 1 ? "s" : ""}</span>
            </div>
            <div className="text-xs text-muted leading-relaxed">
              {booking.rooms.join(", ")}
            </div>
            <div className="pt-1 border-t border-sand-100">
              <span className="text-xs font-semibold text-terracotta">
                {booking.estimatedTotal.toLocaleString("fr-FR")} MAD
              </span>
            </div>
          </div>

          {/* Right: actions */}
          <div className="p-4 flex flex-col gap-2">
            {!booking.checkedIn && booking.status !== "completed" && (
              <button
                onClick={doCheckIn}
                disabled={isPending}
                className="flex items-center gap-2 w-full rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
              >
                {actionDone === "checkin" ? (
                  <IconCheck size={14} className="text-emerald-600" />
                ) : (
                  <IconLogIn size={14} className="text-emerald-600" />
                )}
                {actionDone === "checkin" ? "Enregistré !" : "Check-in"}
              </button>
            )}

            {booking.checkedIn && booking.status !== "completed" && (
              <button
                onClick={doCheckOut}
                disabled={isPending}
                className="flex items-center gap-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
              >
                {actionDone === "checkout" ? (
                  <IconCheck size={14} className="text-slate-600" />
                ) : (
                  <IconLogOut size={14} className="text-slate-600" />
                )}
                {actionDone === "checkout" ? "Check-out effectué !" : "Check-out"}
              </button>
            )}

            <Link
              href={`/admin/bookings/${booking.id}`}
              onClick={onClose}
              className="flex items-center gap-2 w-full rounded-xl bg-terracotta/5 border border-terracotta/20 px-3 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/10 transition"
            >
              <IconArrowRight size={14} />
              Voir la réservation
            </Link>

            {booking.status === "confirmed" && !booking.checkedIn && (
              <p className="text-[10px] text-muted text-center pt-1">
                Marquez le check-in à l'arrivée du client
              </p>
            )}
            {booking.checkedIn && (
              <p className="text-[10px] text-emerald-600 text-center pt-1">
                Client présent au riad
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(popupNode, document.body);
}

// ─── Main grid ────────────────────────────────────────────────────────────────

export function CalendarGrid({ rooms, dateStrs, grid, bookings, todayStr }: Props) {
  const [popup, setPopup] = useState<PopupState | null>(null);

  const CELL_W = 38;
  const ROW_H = 40;

  function handleCellClick(e: React.MouseEvent, cell: CellKind) {
    if (cell.type !== "booking") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopup({ bookingId: cell.bookingId, anchorRect: rect });
  }

  const popupBooking = popup ? bookings[popup.bookingId] : null;

  return (
    <div className="relative">
      {/* Scrollable table wrapper */}
      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-sm">
        <table className="border-collapse" style={{ minWidth: dateStrs.length * CELL_W + 160 }}>
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-white border-b border-r border-sand-100 px-3 py-2.5 text-left text-xs font-semibold text-muted min-w-[140px]">
                Chambre
              </th>
              {dateStrs.map((d) => {
                const isToday = d === todayStr;
                return (
                  <th
                    key={d}
                    className={`border-b border-r border-sand-100 text-center py-2 px-0 text-[10px] font-medium whitespace-nowrap ${
                      isToday ? "bg-terracotta/10 text-terracotta font-bold" : "text-muted bg-sand/30"
                    }`}
                    style={{ width: CELL_W, minWidth: CELL_W }}
                  >
                    {fmtDay(d)}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, ri) => (
              <tr key={room.id} className={ri % 2 === 0 ? "bg-white" : "bg-sand/20"}>
                <td className="sticky left-0 z-10 border-b border-r border-sand-100 px-3 py-0 text-xs font-medium text-ink whitespace-nowrap" style={{ background: ri % 2 === 0 ? "#ffffff" : "#f7f3ee55", height: ROW_H }}>
                  {room.name}
                </td>
                {dateStrs.map((d) => {
                  const cell = grid[room.id]?.[d] ?? { type: "free" as const };
                  return (
                    <td
                      key={d}
                      className={`border-b border-r border-sand-100 p-0 relative ${d === todayStr ? "bg-terracotta/5" : ""}`}
                      style={{ height: ROW_H, width: CELL_W }}
                    >
                      <CellContent cell={cell} onCellClick={handleCellClick} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-5 px-1 flex-wrap">
        {(Object.entries(STATUS) as [StatusKey, (typeof STATUS)[StatusKey]][]).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5">
            <span className={`inline-block h-3 w-3 rounded-sm ${v.bar}`} />
            <span className="text-xs text-muted">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{ background: "repeating-linear-gradient(-45deg,#D5C9B8 0,#D5C9B8 2px,transparent 2px,transparent 6px)" }}
          />
          <span className="text-xs text-muted">Bloqué</span>
        </div>
      </div>

      {/* Popup rendered via portal so it escapes overflow:hidden containers */}
      {popup && popupBooking && (
        <BookingPopup
          booking={popupBooking}
          anchorRect={popup.anchorRect}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}

// ─── Cell renderer ────────────────────────────────────────────────────────────

function CellContent({
  cell,
  onCellClick,
}: {
  cell: CellKind;
  onCellClick: (e: React.MouseEvent, cell: CellKind) => void;
}) {
  if (cell.type === "free") {
    return <div className="h-full w-full" />;
  }

  if (cell.type === "blocked") {
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            "repeating-linear-gradient(-45deg,#D5C9B8 0,#D5C9B8 2px,transparent 2px,transparent 8px)",
        }}
      />
    );
  }

  // booking
  const sk = statusKey(cell);
  const s = STATUS[sk];
  const roundLeft = cell.actualStart ? "rounded-l-md" : "";
  const roundRight = cell.actualEnd ? "rounded-r-md" : "";
  const marginLeft = cell.actualStart ? "ml-0.5" : "";
  const marginRight = cell.actualEnd ? "mr-0.5" : "";

  return (
    <div
      className="h-full w-full flex items-center cursor-pointer"
      onClick={(e) => onCellClick(e, cell)}
    >
      <div
        className={`h-6 w-full ${s.bar} ${roundLeft} ${roundRight} ${marginLeft} ${marginRight} flex items-center px-1.5 overflow-hidden transition-opacity hover:opacity-80`}
        title={`${cell.guestName} · ${s.label}`}
      >
        {cell.isFirst && (
          <span className={`text-[9px] font-semibold truncate leading-none ${s.text} whitespace-nowrap`}>
            {cell.guestName.split(" ")[0]}
          </span>
        )}
      </div>
    </div>
  );
}
