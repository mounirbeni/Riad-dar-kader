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

const STATUS: Record<StatusKey, { bar: string; text: string; label: string; hex: string }> = {
  pending:   { bar: "bg-amber-400",   text: "text-amber-950",  label: "En attente", hex: "#fbbf24" },
  confirmed: { bar: "bg-terracotta",  text: "text-white",      label: "Confirmée",  hex: "#8B3A2A" },
  checkedIn: { bar: "bg-emerald-500", text: "text-white",      label: "Arrivé(e)",  hex: "#10b981" },
  completed: { bar: "bg-slate-300",   text: "text-slate-700",  label: "Terminée",   hex: "#cbd5e1" },
};

function statusKey(cell: Extract<CellKind, { type: "booking" }>): StatusKey {
  if (cell.checkedIn) return "checkedIn";
  if (cell.status === "completed") return "completed";
  if (cell.status === "confirmed") return "confirmed";
  return "pending";
}

function parseDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00Z");
}

function fmtDate(dateStr: string, short = false) {
  const d = parseDate(dateStr);
  if (short) return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

function weekdayShort(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "").toUpperCase();
}

function dayNumber(dateStr: string) {
  return parseDate(dateStr).getUTCDate();
}

function isWeekend(dateStr: string) {
  const day = parseDate(dateStr).getUTCDay(); // 0=Sun, 6=Sat
  return day === 0 || day === 6;
}

function monthLabel(dateStr: string) {
  return parseDate(dateStr).toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");
}

// Returns true when this date starts a new month relative to the previous date in the list
function isMonthStart(dateStrs: string[], idx: number) {
  if (idx === 0) return true;
  return parseDate(dateStrs[idx]).getUTCMonth() !== parseDate(dateStrs[idx - 1]).getUTCMonth();
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

  const popupStyle: CSSProperties = (() => {
    const POPUP_W = 420;
    const POPUP_H = 290;
    const GAP = 10;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let top = anchorRect.bottom + GAP;
    let left = anchorRect.left;
    if (left + POPUP_W > vpW - 12) left = vpW - POPUP_W - 12;
    if (left < 12) left = 12;
    if (anchorRect.bottom + POPUP_H + GAP > vpH) top = anchorRect.top - POPUP_H - GAP;
    return { position: "fixed", top, left, width: POPUP_W, zIndex: 9999 };
  })();

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const sk = booking.checkedIn ? "checkedIn" : booking.status === "completed" ? "completed" : booking.status === "confirmed" ? "confirmed" : "pending" as StatusKey;
  const s = STATUS[sk];

  function doCheckIn() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", booking.id);
      const res = await checkInGuestAction({ ok: false }, fd);
      if (res.ok) { setActionDone("checkin"); setTimeout(() => { onClose(); router.refresh(); }, 700); }
    });
  }

  function doCheckOut() {
    startTransition(async () => {
      const fd = new FormData();
      fd.append("bookingId", booking.id);
      const res = await checkOutGuestAction({ ok: false }, fd);
      if (res.ok) { setActionDone("checkout"); setTimeout(() => { onClose(); router.refresh(); }, 700); }
    });
  }

  return createPortal(
    <div ref={ref} style={popupStyle} className="pointer-events-auto">
      <div className="rounded-2xl border border-sand-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`${s.bar} px-4 py-3 flex items-center justify-between gap-3`}>
          <div className="flex items-center gap-3 min-w-0">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${s.text} opacity-75`}>{s.label}</span>
            <span className={`font-mono text-xs font-bold ${s.text} bg-black/10 px-2 py-0.5 rounded-md`}>{booking.reference}</span>
          </div>
          <button onClick={onClose} className={`shrink-0 rounded-lg p-1 hover:bg-black/10 transition ${s.text}`}>
            <IconX size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-2 divide-x divide-sand-100">
          {/* Left: details */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-start gap-2">
              <IconUser size={13} className="text-muted shrink-0 mt-0.5" />
              <span className="font-semibold text-ink text-sm leading-tight">{booking.guestName}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconCalendar size={13} className="text-muted shrink-0" />
              <span className="text-xs text-muted">{fmtDate(booking.checkIn, true)} → {fmtDate(booking.checkOut, true)}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <IconMoon size={12} className="text-muted" />{booking.nights} nuit{booking.nights !== 1 ? "s" : ""}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted">
                <IconUsers size={12} className="text-muted" />{booking.guests} pers.
              </span>
            </div>
            <div className="text-xs text-muted/80 leading-relaxed truncate">{booking.rooms.join(", ")}</div>
            <div className="pt-2 border-t border-sand-100 flex items-center justify-between">
              <span className="text-xs font-bold text-terracotta">{booking.estimatedTotal.toLocaleString("fr-FR")} MAD</span>
              {booking.checkedIn && (
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">Au riad</span>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="p-4 flex flex-col gap-2">
            {!booking.checkedIn && booking.status !== "completed" && (
              <button
                onClick={doCheckIn}
                disabled={isPending}
                className="flex items-center gap-2 w-full rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                {actionDone === "checkin" ? <IconCheck size={14} /> : <IconLogIn size={14} />}
                {actionDone === "checkin" ? "Enregistré !" : "Check-in"}
              </button>
            )}
            {booking.checkedIn && booking.status !== "completed" && (
              <button
                onClick={doCheckOut}
                disabled={isPending}
                className="flex items-center gap-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {actionDone === "checkout" ? <IconCheck size={14} /> : <IconLogOut size={14} />}
                {actionDone === "checkout" ? "Check-out effectué !" : "Check-out"}
              </button>
            )}
            <Link
              href={`/admin/bookings/${booking.id}`}
              onClick={onClose}
              className="flex items-center gap-2 w-full rounded-xl bg-terracotta/5 border border-terracotta/20 px-3 py-2.5 text-sm font-medium text-terracotta hover:bg-terracotta/10 transition-colors"
            >
              <IconArrowRight size={14} />
              Voir la réservation
            </Link>
            {booking.status === "pending" && (
              <p className="text-[10px] text-amber-600 text-center pt-1">En attente de confirmation</p>
            )}
            {booking.status === "confirmed" && !booking.checkedIn && (
              <p className="text-[10px] text-muted text-center pt-1">Check-in à l'arrivée du client</p>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Main grid ────────────────────────────────────────────────────────────────

const CELL_W = 46;
const ROOM_COL_W = 160;
const ROW_H = 48;

export function CalendarGrid({ rooms, dateStrs, grid, bookings, todayStr }: Props) {
  const [popup, setPopup] = useState<PopupState | null>(null);
  const popupBooking = popup ? bookings[popup.bookingId] : null;

  function handleCellClick(e: React.MouseEvent, cell: CellKind) {
    if (cell.type !== "booking") return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopup({ bookingId: cell.bookingId, anchorRect: rect });
  }

  return (
    <div>
      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white shadow-sm">
        <table
          className="border-collapse"
          style={{ minWidth: dateStrs.length * CELL_W + ROOM_COL_W, tableLayout: "fixed" }}
        >
          {/* ── Header ── */}
          <thead>
            {/* Month labels row — only renders when a new month starts mid-grid */}
            <tr>
              <th
                className="sticky left-0 z-20 bg-white border-b-0"
                style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W }}
              />
              {dateStrs.map((d, i) => {
                const newMonth = isMonthStart(dateStrs, i);
                return (
                  <th
                    key={d}
                    className="p-0 border-b-0"
                    style={{ width: CELL_W }}
                  >
                    {newMonth ? (
                      <div className="text-[9px] font-bold uppercase tracking-widest text-terracotta pt-2 pl-1">
                        {monthLabel(d)}
                      </div>
                    ) : null}
                  </th>
                );
              })}
            </tr>

            {/* Day header row */}
            <tr>
              <th
                className="sticky left-0 z-20 bg-white border-b border-r border-sand-200 px-4 text-left"
                style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W, height: 52 }}
              >
                <span className="text-xs font-semibold text-muted">Chambre</span>
              </th>
              {dateStrs.map((d) => {
                const today = d === todayStr;
                const weekend = isWeekend(d);
                return (
                  <th
                    key={d}
                    className={`border-b border-r border-sand-200 p-0 text-center ${
                      today
                        ? "bg-terracotta text-white"
                        : weekend
                        ? "bg-sand-100 text-muted"
                        : "bg-sand/40 text-ink"
                    }`}
                    style={{ width: CELL_W, height: 52 }}
                  >
                    <div className="flex flex-col items-center justify-center gap-0.5 py-1.5">
                      <span className={`text-[9px] font-semibold uppercase tracking-widest ${today ? "text-white/70" : "text-muted/60"}`}>
                        {weekdayShort(d)}
                      </span>
                      <span className={`text-sm font-bold leading-none ${today ? "text-white" : weekend ? "text-slate-500" : "text-ink"}`}>
                        {dayNumber(d)}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {rooms.map((room, ri) => {
              const isEven = ri % 2 === 0;
              const rowBg = isEven ? "#ffffff" : "#faf8f5";
              return (
                <tr key={room.id}>
                  {/* Room name */}
                  <td
                    className="sticky left-0 z-10 border-b border-r border-sand-200 px-4"
                    style={{ background: rowBg, height: ROW_H, width: ROOM_COL_W }}
                  >
                    <span className="text-sm font-medium text-ink leading-tight">{room.name}</span>
                  </td>

                  {/* Date cells */}
                  {dateStrs.map((d) => {
                    const cell = grid[room.id]?.[d] ?? { type: "free" as const };
                    const today = d === todayStr;
                    const weekend = isWeekend(d);
                    const isNonLastBooking = cell.type === "booking" && !cell.actualEnd;

                    let bg = rowBg;
                    if (cell.type !== "booking") {
                      if (today) bg = "#8B3A2A12";
                      else if (weekend) bg = "#F5F0E8";
                    }

                    return (
                      <td
                        key={d}
                        className={`border-b p-0 ${isNonLastBooking ? "" : "border-r border-r-sand-200"}`}
                        style={{ height: ROW_H, width: CELL_W, background: bg }}
                      >
                        <CellContent cell={cell} onCellClick={handleCellClick} />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Legend ── */}
      <div className="mt-3 flex items-center gap-5 px-1 flex-wrap">
        {(Object.entries(STATUS) as [StatusKey, (typeof STATUS)[StatusKey]][]).map(([, v]) => (
          <div key={v.label} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-5 rounded-sm ${v.bar}`} />
            <span className="text-xs text-muted">{v.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-5 rounded-sm"
            style={{ background: "repeating-linear-gradient(-45deg,#D5C9B8 0,#D5C9B8 2px,transparent 2px,transparent 6px)" }}
          />
          <span className="text-xs text-muted">Bloqué</span>
        </div>
      </div>

      {/* Popup */}
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
  if (cell.type === "free") return null;

  if (cell.type === "blocked") {
    return (
      <div
        className="w-full h-full"
        style={{
          background: "repeating-linear-gradient(-45deg,#D5C9B8 0,#D5C9B8 2px,transparent 2px,transparent 8px)",
        }}
      />
    );
  }

  const sk = statusKey(cell);
  const s = STATUS[sk];

  const barStyle: CSSProperties = {
    marginLeft: cell.actualStart ? 3 : 0,
    marginRight: cell.actualEnd ? 3 : 0,
    borderRadius: `${cell.actualStart ? 6 : 0}px ${cell.actualEnd ? 6 : 0}px ${cell.actualEnd ? 6 : 0}px ${cell.actualStart ? 6 : 0}px`,
  };

  return (
    <div
      className="h-full w-full flex items-center cursor-pointer select-none"
      onClick={(e) => onCellClick(e, cell)}
    >
      <div
        className={`${s.bar} hover:opacity-80 transition-opacity overflow-hidden flex items-center`}
        style={{ ...barStyle, height: 30, width: "100%" }}
        title={`${cell.guestName} · ${s.label}`}
      >
        {cell.isFirst && (
          <span
            className={`text-[10px] font-semibold leading-none whitespace-nowrap px-2 ${s.text}`}
          >
            {cell.guestName}
          </span>
        )}
      </div>
    </div>
  );
}
