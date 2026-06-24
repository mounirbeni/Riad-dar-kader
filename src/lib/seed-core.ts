// Shared, idempotent seed logic used by both the Prisma CLI seed
// (prisma/seed.ts) and the protected bootstrap route (/api/seed).
// Safe to run multiple times — everything is upserted.
// All prices are in EUR (euros).

import type { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const seedRooms = [
  {
    name: "Chambre Mouassine",
    slug: "mouassine",
    description:
      "Chambre double élégante avec zellige fait main et vue sur le patio. Idéale pour un couple en quête de calme au cœur de la Médina. Les tons terracotta et la lumière douce du patio en font un cocon paisible.",
    descriptionEn:
      "An elegant double room with handmade zellige and a patio view. Perfect for a couple seeking calm in the heart of the Medina. Terracotta tones and the soft patio light make it a peaceful retreat.",
    capacity: 2,
    basePrice: 85,
    sizeM2: 18,
    bedType: "double",
    view: "patio",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe"],
    sortOrder: 1,
  },
  {
    name: "Chambre Saadienne",
    slug: "saadienne",
    description:
      "Une chambre lumineuse aux tons terracotta, ornée de stuc traditionnel sculpté à la main. Son atmosphère chaleureuse invite au repos après une journée dans les souks.",
    descriptionEn:
      "A light-filled room in terracotta tones, adorned with hand-carved traditional stucco. Its warm atmosphere invites rest after a day in the souks.",
    capacity: 2,
    basePrice: 90,
    sizeM2: 20,
    bedType: "double",
    view: "patio",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating"],
    sortOrder: 2,
  },
  {
    name: "Chambre Bahia",
    slug: "bahia",
    description:
      "Chambre raffinée inspirée des palais de la Médina, calme et fraîche. Boiseries sculptées et tadelakt poli composent un décor à la fois sobre et noble.",
    descriptionEn:
      "A refined room inspired by the palaces of the Medina, cool and quiet. Carved woodwork and polished tadelakt create a setting that is both understated and noble.",
    capacity: 2,
    basePrice: 95,
    sizeM2: 22,
    bedType: "twin",
    view: "patio",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating"],
    sortOrder: 3,
  },
  {
    name: "Chambre Koutoubia",
    slug: "koutoubia",
    description:
      "Chambre confortable pouvant accueillir une troisième personne, parfaite pour les petites familles ou les amis. Spacieuse et baignée de lumière naturelle.",
    descriptionEn:
      "A comfortable room that can host a third guest — perfect for small families or friends. Spacious and bathed in natural light.",
    capacity: 3,
    basePrice: 110,
    sizeM2: 26,
    bedType: "double_sofa",
    view: "patio",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating", "breakfast"],
    sortOrder: 4,
  },
  {
    name: "Suite Medina",
    slug: "medina",
    description:
      "Suite spacieuse avec coin salon marocain, pensée pour les familles. Un véritable petit appartement traditionnel où chacun trouve son espace.",
    descriptionEn:
      "A spacious suite with a Moroccan lounge corner, designed for families. A true traditional little apartment where everyone finds their own space.",
    capacity: 4,
    basePrice: 145,
    sizeM2: 34,
    bedType: "family",
    view: "medina",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating", "breakfast"],
    sortOrder: 5,
  },
  {
    name: "Suite Patio",
    slug: "patio",
    description:
      "Grande suite ouverte sur le patio central, lumière douce toute la journée. Son emplacement privilégié offre le murmure apaisant de la fontaine.",
    descriptionEn:
      "A large suite opening onto the central patio, with soft light all day long. Its prime location offers the soothing murmur of the fountain.",
    capacity: 3,
    basePrice: 130,
    sizeM2: 30,
    bedType: "double_sofa",
    view: "patio",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating", "breakfast"],
    sortOrder: 6,
  },
  {
    name: "Suite Terrasse",
    slug: "terrasse",
    description:
      "La plus belle suite du riad, avec accès privilégié à la terrasse panoramique. Réveillez-vous face aux toits de la Médina et aux montagnes de l'Atlas à l'horizon.",
    descriptionEn:
      "The finest suite in the riad, with privileged access to the panoramic terrace. Wake up to the rooftops of the Medina and the Atlas mountains on the horizon.",
    capacity: 4,
    basePrice: 160,
    sizeM2: 38,
    bedType: "family",
    view: "terrace",
    amenities: ["wifi", "ac", "ensuite", "tea", "safe", "heating", "breakfast", "terrace"],
    sortOrder: 7,
  },
];

export const seedExtras = [
  { slug: "airport-transfer", nameFr: "Transfert aéroport", name: "Airport transfer", descriptionFr: "Accueil et transfert privé depuis l'aéroport de Marrakech.", description: "Private pick-up and transfer from Marrakech airport.", price: 25, priceType: "per_booking" as const, sortOrder: 1 },
  { slug: "moroccan-breakfast", nameFr: "Petit-déjeuner marocain", name: "Moroccan breakfast", descriptionFr: "Petit-déjeuner traditionnel servi sur la terrasse ou au patio.", description: "Traditional breakfast served on the terrace or patio.", price: 9, priceType: "per_guest" as const, sortOrder: 2 },
  { slug: "terrace-dinner", nameFr: "Dîner sur la terrasse", name: "Dinner on the terrace", descriptionFr: "Dîner marocain aux chandelles sous le ciel de Marrakech.", description: "Candlelit Moroccan dinner under the Marrakech sky.", price: 22, priceType: "per_guest" as const, sortOrder: 3 },
  { slug: "guided-medina-tour", nameFr: "Visite guidée de la Médina", name: "Guided Medina tour", descriptionFr: "Découverte des souks et monuments avec un guide local.", description: "Explore the souks and monuments with a local guide.", price: 35, priceType: "per_booking" as const, sortOrder: 4 },
  { slug: "hammam-spa", nameFr: "Hammam / spa partenaire", name: "Hammam / spa request", descriptionFr: "Réservation d'un moment bien-être dans un hammam partenaire.", description: "Booking a wellness moment at a partner hammam.", price: 30, priceType: "per_guest" as const, sortOrder: 5 },
  { slug: "romantic-decoration", nameFr: "Décoration romantique", name: "Romantic room decoration", descriptionFr: "Pétales, bougies et attentions pour une occasion spéciale.", description: "Petals, candles and special touches for a memorable moment.", price: 20, priceType: "per_booking" as const, sortOrder: 6 },
  { slug: "birthday-setup", nameFr: "Décoration anniversaire", name: "Birthday setup", descriptionFr: "Une mise en place festive pour célébrer un anniversaire.", description: "A festive setup to celebrate a birthday.", price: 25, priceType: "per_booking" as const, sortOrder: 7 },
  { slug: "cooking-experience", nameFr: "Atelier cuisine privé", name: "Private cooking experience", descriptionFr: "Apprenez à préparer un tajine avec notre cuisinière.", description: "Learn to prepare a tagine with our cook.", price: 40, priceType: "per_guest" as const, sortOrder: 8 },
  { slug: "early-check-in", nameFr: "Arrivée anticipée", name: "Early check-in request", descriptionFr: "Demande d'arrivée avant l'heure standard (selon disponibilité).", description: "Request to arrive before standard check-in (subject to availability).", price: 0, priceType: "per_booking" as const, sortOrder: 9 },
  { slug: "late-check-out", nameFr: "Départ tardif", name: "Late check-out request", descriptionFr: "Demande de départ après l'heure standard (selon disponibilité).", description: "Request to leave after standard check-out (subject to availability).", price: 0, priceType: "per_booking" as const, sortOrder: 10 },
];

export const seedSettings = [
  { key: "hold_pending_availability", value: "false" },
  { key: "min_nights", value: "1" },
];

export type SeedSummary = { rooms: number; extras: number; admin: string };

export async function runSeed(prisma: PrismaClient): Promise<SeedSummary> {
  const email = (process.env.ADMIN_EMAIL || "owner@mbndemo.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    await prisma.adminUser.deleteMany({});
  }
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Owner", role: "owner" },
  });

  for (const room of seedRooms) {
    await prisma.room.upsert({ where: { slug: room.slug }, update: room, create: room });
  }
  for (const extra of seedExtras) {
    await prisma.extra.upsert({ where: { slug: extra.slug }, update: extra, create: extra });
  }
  for (const s of seedSettings) {
    await prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  return { rooms: seedRooms.length, extras: seedExtras.length, admin: email };
}
