import { prisma } from "@/lib/prisma";
import { eachNight, todayUTC } from "@/lib/dates";

export type DashboardStats = {
  pending: number;
  confirmedUpcoming: number;
  bookingsThisMonth: number;
  estimatedRevenueMonth: number;
  occupancyRate: number; // 0..100 for the current month
  upcomingArrivals: {
    id: string;
    reference: string;
    guestName: string;
    checkIn: Date;
    checkOut: Date;
    guests: number;
    status: string;
  }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = todayUTC();
  const monthStart = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
  );
  const monthEnd = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1)
  );
  const daysInMonth = Math.round(
    (monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  const [
    pending,
    activeRooms,
    bookingsThisMonth,
    confirmedThisMonth,
    upcoming,
    confirmedUpcoming,
  ] = await Promise.all([
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.room.count({ where: { isActive: true } }),
    prisma.booking.count({
      where: { createdAt: { gte: monthStart, lt: monthEnd } },
    }),
    prisma.booking.findMany({
      where: {
        status: "confirmed",
        checkIn: { lt: monthEnd },
        checkOut: { gt: monthStart },
      },
      select: {
        estimatedTotal: true,
        checkIn: true,
        checkOut: true,
        rooms: { select: { roomId: true } },
      },
    }),
    prisma.booking.findMany({
      where: { status: { in: ["confirmed", "pending"] }, checkIn: { gte: today } },
      orderBy: { checkIn: "asc" },
      take: 8,
      select: {
        id: true,
        reference: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        guests: true,
        status: true,
      },
    }),
    prisma.booking.count({
      where: { status: "confirmed", checkIn: { gte: today } },
    }),
  ]);

  // Estimated revenue for the month (confirmed bookings touching the month).
  const estimatedRevenueMonth = confirmedThisMonth.reduce(
    (sum, b) => sum + b.estimatedTotal,
    0
  );

  // Occupancy = booked room-nights / available room-nights within the month.
  const capacityRoomNights = activeRooms * daysInMonth;
  let bookedRoomNights = 0;
  for (const b of confirmedThisMonth) {
    const nights = eachNight(b.checkIn, b.checkOut).filter(
      (d) => d >= monthStart && d < monthEnd
    ).length;
    bookedRoomNights += nights * b.rooms.length;
  }
  const occupancyRate =
    capacityRoomNights > 0
      ? Math.min(100, Math.round((bookedRoomNights / capacityRoomNights) * 100))
      : 0;

  return {
    pending,
    confirmedUpcoming,
    bookingsThisMonth,
    estimatedRevenueMonth,
    occupancyRate,
    upcomingArrivals: upcoming,
  };
}
