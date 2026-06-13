import { z } from "zod";

const dateOnly = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD");

export const availabilitySchema = z.object({
  checkIn: dateOnly,
  checkOut: dateOnly,
  guests: z.coerce.number().int().min(1).max(20),
});

export const bookingExtraInputSchema = z.object({
  extraId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(20).default(1),
});

export const createBookingSchema = z.object({
  checkIn: dateOnly,
  checkOut: dateOnly,
  guests: z.coerce.number().int().min(1).max(20),
  optionKey: z.enum(["couple", "standard", "family", "group", "full_riad"]),
  guestName: z.string().trim().min(2, "Name is too short").max(120),
  guestEmail: z.string().trim().email("Invalid email").max(160),
  guestPhone: z
    .string()
    .trim()
    .min(6, "Phone is too short")
    .max(30)
    .regex(/^[+0-9()\-\s]+$/, "Invalid phone number"),
  guestCountry: z.string().trim().max(80).optional().or(z.literal("")),
  specialRequests: z.string().trim().max(1000).optional().or(z.literal("")),
  extras: z.array(bookingExtraInputSchema).max(20).default([]),
  // Honeypot — must stay empty.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(5).max(2000),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const adminLoginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1).max(200),
});

// --- Admin management schemas ---

export const roomSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  description: z.string().trim().max(2000),
  capacity: z.coerce.number().int().min(1).max(12),
  basePrice: z.coerce.number().int().min(0).max(1_000_000),
  isActive: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const extraSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens"),
  name: z.string().trim().min(1).max(160),
  nameFr: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000),
  descriptionFr: z.string().trim().max(1000),
  price: z.coerce.number().int().min(0).max(1_000_000),
  priceType: z.enum(["per_booking", "per_guest", "per_night"]),
  isActive: z.coerce.boolean(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const blockDateSchema = z
  .object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    roomId: z.string().optional().or(z.literal("")),
    reason: z.string().trim().max(200).optional().or(z.literal("")),
  });

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal("")),
});
