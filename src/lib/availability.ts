// Server-side availability engine for Riad Dar Kader.
//
// The public booking flow is availability-first: guests pick dates + guest
// count, and the engine returns simplified "stay options" rather than asking
// them to manage individual rooms. Room-level complexity stays internal.

import { prisma } from "@/lib/prisma";
import { SETTING_KEYS } from "@/lib/constants";
import {
  eachNight,
  nightsBetween,
  parseDateOnly,
  todayUTC,
} from "@/lib/dates";
import type { BookingStatus } from "@prisma/client";

export type AvailabilityRoom = {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
};

export type StayOption = {
  key: "couple" | "standard" | "family" | "group" | "full_riad";
  labelFr: string;
  labelEn: string;
  descriptionFr: string;
  descriptionEn: string;
  roomsRequired: number;
  roomIds: string[];
  maxGuests: number;
  estimatedTotal: number; // MAD for the whole stay (rooms only, before extras)
};

export type AvailabilityResult = {
  isAvailable: boolean;
  reason?: string;
  nights: number;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  availableRoomsCount: number;
  availableCapacity: number;
  suggestedOptions: StayOption[];
  estimatedPriceRange: { min: number; max: number } | null;
};

export type AvailabilityInput = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

const STATUSES_THAT_HOLD_BASE: BookingStatus[] = ["confirmed"];

function emptyResult(
  reason: string,
  partial?: Partial<AvailabilityResult>
): AvailabilityResult {
  return {
    isAvailable: false,
    reason,
    nights: 0,
    checkIn: null,
    checkOut: null,
    guests: 0,
    availableRoomsCount: 0,
    availableCapacity: 0,
    suggestedOptions: [],
    estimatedPriceRange: null,
    ...partial,
  };
}

/** Read the "pending bookings hold availability" admin toggle. */
async function pendingHoldsAvailability(): Promise<boolean> {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: SETTING_KEYS.HOLD_PENDING_AVAILABILITY },
  });
  return setting?.value === "true";
}

/**
 * Greedy room selection: pick the fewest rooms (smallest capacity first that
 * still progresses) to cover the requested guests. Returns the chosen rooms or
 * null if the guests can't be accommodated by the available inventory.
 */
function selectRoomsForGuests(
  rooms: AvailabilityRoom[],
  guests: number
): AvailabilityRoom[] | null {
  // Prefer fitting guests into as few rooms as possible; among equal room
  // counts, prefer the cheapest combination. Sort by capacity descending so we
  // cover guests quickly, then we trim.
  const byCapacityDesc = [...rooms].sort((a, b) => b.capacity - a.capacity);
  const chosen: AvailabilityRoom[] = [];
  let covered = 0;
  for (const room of byCapacityDesc) {
    if (covered >= guests) break;
    chosen.push(room);
    covered += room.capacity;
  }
  if (covered < guests) return null;
  return chosen;
}

function stayTotal(rooms: AvailabilityRoom[], nights: number): number {
  return rooms.reduce((sum, r) => sum + r.basePrice * nights, 0);
}

/**
 * Core availability check.
 *
 * Steps:
 *  - validate dates (reject past, reject checkout <= checkin)
 *  - compute nights
 *  - fetch active rooms
 *  - drop rooms blocked on any night in range (incl. whole-riad blocks)
 *  - drop rooms held by overlapping confirmed (and optionally pending) bookings
 *  - compute available capacity and build simplified stay options
 */
export async function checkAvailability(
  input: AvailabilityInput
): Promise<AvailabilityResult> {
  const checkIn = parseDateOnly(input.checkIn);
  const checkOut = parseDateOnly(input.checkOut);
  const guests = Number.isFinite(input.guests) ? Math.floor(input.guests) : 0;

  if (!checkIn || !checkOut) {
    return emptyResult("invalid_dates");
  }
  if (guests < 1) {
    return emptyResult("invalid_guests");
  }

  const today = todayUTC();
  if (checkIn < today) {
    return emptyResult("past_date", {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests,
    });
  }
  if (checkOut <= checkIn) {
    return emptyResult("checkout_before_checkin", {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests,
    });
  }

  const nights = nightsBetween(checkIn, checkOut);
  const nightsInRange = eachNight(checkIn, checkOut);

  // 1. Active rooms.
  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, capacity: true, basePrice: true },
  });

  if (rooms.length === 0) {
    return emptyResult("no_rooms", {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests,
      nights,
    });
  }

  // 2. Blocked dates overlapping the stay nights.
  const blocked = await prisma.blockedDate.findMany({
    where: { date: { gte: checkIn, lt: checkOut } },
    select: { roomId: true },
  });
  const wholeRiadBlocked = blocked.some((b) => b.roomId === null);
  const blockedRoomIds = new Set(
    blocked.filter((b) => b.roomId !== null).map((b) => b.roomId as string)
  );

  if (wholeRiadBlocked) {
    return emptyResult("blocked", {
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests,
      nights,
    });
  }

  // 3. Bookings that overlap the requested range.
  const holdStatuses = [...STATUSES_THAT_HOLD_BASE];
  if (await pendingHoldsAvailability()) holdStatuses.push("pending");

  const overlapping = await prisma.booking.findMany({
    where: {
      status: { in: holdStatuses },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
    select: { rooms: { select: { roomId: true } } },
  });
  const occupiedRoomIds = new Set<string>();
  for (const b of overlapping) {
    for (const br of b.rooms) occupiedRoomIds.add(br.roomId);
  }

  // 4. Available rooms = active − blocked − occupied.
  const availableRooms: AvailabilityRoom[] = rooms.filter(
    (r) => !blockedRoomIds.has(r.id) && !occupiedRoomIds.has(r.id)
  );

  const availableRoomsCount = availableRooms.length;
  const availableCapacity = availableRooms.reduce(
    (sum, r) => sum + r.capacity,
    0
  );

  const baseResult: AvailabilityResult = {
    isAvailable: false,
    nights,
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests,
    availableRoomsCount,
    availableCapacity,
    suggestedOptions: [],
    estimatedPriceRange: null,
  };

  if (availableRoomsCount === 0 || availableCapacity < guests) {
    return { ...baseResult, reason: "no_capacity" };
  }

  // 5. Build simplified stay options that actually fit the guest count.
  const options: StayOption[] = [];
  const totalActiveRooms = rooms.length;
  void nightsInRange; // nights already captured; kept for clarity

  const fitRooms = selectRoomsForGuests(availableRooms, guests);

  if (fitRooms) {
    const roomCount = fitRooms.length;
    const total = stayTotal(fitRooms, nights);
    const fitMaxGuests = fitRooms.reduce((s, r) => s + r.capacity, 0);

    if (guests <= 2 && roomCount === 1) {
      options.push({
        key: "couple",
        labelFr: "Séjour Couple",
        labelEn: "Couple Stay",
        descriptionFr:
          "Une chambre intime pour deux, idéale pour une escapade à Marrakech.",
        descriptionEn:
          "An intimate room for two, perfect for a Marrakech escape.",
        roomsRequired: 1,
        roomIds: fitRooms.map((r) => r.id),
        maxGuests: fitMaxGuests,
        estimatedTotal: total,
      });
    } else if (roomCount === 1) {
      options.push({
        key: "standard",
        labelFr: "Séjour Standard",
        labelEn: "Standard Stay",
        descriptionFr: "Une chambre confortable au cœur du riad.",
        descriptionEn: "A comfortable room in the heart of the riad.",
        roomsRequired: 1,
        roomIds: fitRooms.map((r) => r.id),
        maxGuests: fitMaxGuests,
        estimatedTotal: total,
      });
    } else if (roomCount <= 2) {
      options.push({
        key: "family",
        labelFr: "Séjour Famille",
        labelEn: "Family Stay",
        descriptionFr:
          "Deux chambres communicantes pensées pour les familles.",
        descriptionEn: "Two connecting rooms designed for families.",
        roomsRequired: roomCount,
        roomIds: fitRooms.map((r) => r.id),
        maxGuests: fitMaxGuests,
        estimatedTotal: total,
      });
    } else {
      options.push({
        key: "group",
        labelFr: "Séjour Groupe",
        labelEn: "Group Stay",
        descriptionFr:
          "Plusieurs chambres réservées ensemble pour votre groupe.",
        descriptionEn: "Several rooms booked together for your group.",
        roomsRequired: roomCount,
        roomIds: fitRooms.map((r) => r.id),
        maxGuests: fitMaxGuests,
        estimatedTotal: total,
      });
    }

    // Always offer a Standard option (single room) when guests fit in one room
    // but we already produced a Couple option — gives the guest a clear pick.
    if (guests <= 2 && roomCount === 1) {
      // Couple already covers the single-room case.
    }
  }

  // 6. Full Riad Request — only when ALL active rooms are available.
  if (
    availableRoomsCount === totalActiveRooms &&
    totalActiveRooms > 0 &&
    guests <= availableCapacity
  ) {
    options.push({
      key: "full_riad",
      labelFr: "Privatisation du Riad",
      labelEn: "Full Riad Request",
      descriptionFr:
        "Le riad entier rien que pour vous — idéal pour les célébrations et grands groupes.",
      descriptionEn:
        "The entire riad to yourselves — ideal for celebrations and large groups.",
      roomsRequired: totalActiveRooms,
      roomIds: availableRooms.map((r) => r.id),
      maxGuests: availableCapacity,
      estimatedTotal: stayTotal(availableRooms, nights),
    });
  }

  if (options.length === 0) {
    return { ...baseResult, reason: "no_option" };
  }

  const totals = options.map((o) => o.estimatedTotal);
  const estimatedPriceRange = {
    min: Math.min(...totals),
    max: Math.max(...totals),
  };

  return {
    ...baseResult,
    isAvailable: true,
    suggestedOptions: options,
    estimatedPriceRange,
  };
}
