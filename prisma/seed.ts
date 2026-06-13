import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// 7 rooms — names evoke a traditional Marrakech riad.
const rooms = [
  {
    name: "Chambre Mouassine",
    slug: "mouassine",
    description:
      "Chambre double élégante avec zellige fait main et vue sur le patio. Idéale pour un couple.",
    capacity: 2,
    basePrice: 850,
    sortOrder: 1,
  },
  {
    name: "Chambre Saadienne",
    slug: "saadienne",
    description:
      "Une chambre lumineuse aux tons terracotta, ornée de stuc traditionnel.",
    capacity: 2,
    basePrice: 900,
    sortOrder: 2,
  },
  {
    name: "Chambre Bahia",
    slug: "bahia",
    description:
      "Chambre raffinée inspirée des palais de la Médina, calme et fraîche.",
    capacity: 2,
    basePrice: 950,
    sortOrder: 3,
  },
  {
    name: "Chambre Koutoubia",
    slug: "koutoubia",
    description:
      "Chambre confortable pouvant accueillir une troisième personne, parfaite pour les petites familles.",
    capacity: 3,
    basePrice: 1100,
    sortOrder: 4,
  },
  {
    name: "Suite Medina",
    slug: "medina",
    description:
      "Suite spacieuse avec coin salon marocain, pensée pour les familles.",
    capacity: 4,
    basePrice: 1450,
    sortOrder: 5,
  },
  {
    name: "Suite Patio",
    slug: "patio",
    description:
      "Grande suite ouverte sur le patio central, lumière douce toute la journée.",
    capacity: 3,
    basePrice: 1300,
    sortOrder: 6,
  },
  {
    name: "Suite Terrasse",
    slug: "terrasse",
    description:
      "La plus belle suite du riad, avec accès privilégié à la terrasse panoramique.",
    capacity: 4,
    basePrice: 1600,
    sortOrder: 7,
  },
];

// Extras / experiences.
const extras = [
  {
    slug: "airport-transfer",
    nameFr: "Transfert aéroport",
    name: "Airport transfer",
    descriptionFr: "Accueil et transfert privé depuis l'aéroport de Marrakech.",
    description: "Private pick-up and transfer from Marrakech airport.",
    price: 250,
    priceType: "per_booking" as const,
    sortOrder: 1,
  },
  {
    slug: "moroccan-breakfast",
    nameFr: "Petit-déjeuner marocain",
    name: "Moroccan breakfast",
    descriptionFr: "Petit-déjeuner traditionnel servi sur la terrasse ou au patio.",
    description: "Traditional breakfast served on the terrace or patio.",
    price: 90,
    priceType: "per_guest" as const,
    sortOrder: 2,
  },
  {
    slug: "terrace-dinner",
    nameFr: "Dîner sur la terrasse",
    name: "Dinner on the terrace",
    descriptionFr: "Dîner marocain aux chandelles sous le ciel de Marrakech.",
    description: "Candlelit Moroccan dinner under the Marrakech sky.",
    price: 220,
    priceType: "per_guest" as const,
    sortOrder: 3,
  },
  {
    slug: "guided-medina-tour",
    nameFr: "Visite guidée de la Médina",
    name: "Guided Medina tour",
    descriptionFr: "Découverte des souks et monuments avec un guide local.",
    description: "Explore the souks and monuments with a local guide.",
    price: 350,
    priceType: "per_booking" as const,
    sortOrder: 4,
  },
  {
    slug: "hammam-spa",
    nameFr: "Hammam / spa partenaire",
    name: "Hammam / spa request",
    descriptionFr: "Réservation d'un moment bien-être dans un hammam partenaire.",
    description: "Booking a wellness moment at a partner hammam.",
    price: 300,
    priceType: "per_guest" as const,
    sortOrder: 5,
  },
  {
    slug: "romantic-decoration",
    nameFr: "Décoration romantique",
    name: "Romantic room decoration",
    descriptionFr: "Pétales, bougies et attentions pour une occasion spéciale.",
    description: "Petals, candles and special touches for a memorable moment.",
    price: 200,
    priceType: "per_booking" as const,
    sortOrder: 6,
  },
  {
    slug: "birthday-setup",
    nameFr: "Décoration anniversaire",
    name: "Birthday setup",
    descriptionFr: "Une mise en place festive pour célébrer un anniversaire.",
    description: "A festive setup to celebrate a birthday.",
    price: 250,
    priceType: "per_booking" as const,
    sortOrder: 7,
  },
  {
    slug: "cooking-experience",
    nameFr: "Atelier cuisine privé",
    name: "Private cooking experience",
    descriptionFr: "Apprenez à préparer un tajine avec notre cuisinière.",
    description: "Learn to prepare a tagine with our cook.",
    price: 400,
    priceType: "per_guest" as const,
    sortOrder: 8,
  },
  {
    slug: "early-check-in",
    nameFr: "Arrivée anticipée",
    name: "Early check-in request",
    descriptionFr: "Demande d'arrivée avant l'heure standard (selon disponibilité).",
    description: "Request to arrive before standard check-in (subject to availability).",
    price: 0,
    priceType: "per_booking" as const,
    sortOrder: 9,
  },
  {
    slug: "late-check-out",
    nameFr: "Départ tardif",
    name: "Late check-out request",
    descriptionFr: "Demande de départ après l'heure standard (selon disponibilité).",
    description: "Request to leave after standard check-out (subject to availability).",
    price: 0,
    priceType: "per_booking" as const,
    sortOrder: 10,
  },
];

async function main() {
  console.log("🌱 Seeding Riad Dar Kader…");

  // Admin user
  const email = (process.env.ADMIN_EMAIL || "owner@riaddarkader.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Owner", role: "owner" },
  });
  console.log(`👤 Admin: ${email}`);

  // Rooms
  for (const room of rooms) {
    await prisma.room.upsert({
      where: { slug: room.slug },
      update: room,
      create: room,
    });
  }
  console.log(`🛏️  ${rooms.length} rooms`);

  // Extras
  for (const extra of extras) {
    await prisma.extra.upsert({
      where: { slug: extra.slug },
      update: extra,
      create: extra,
    });
  }
  console.log(`✨ ${extras.length} extras`);

  // Settings
  const settings: { key: string; value: string }[] = [
    { key: "hold_pending_availability", value: "false" },
    { key: "min_nights", value: "1" },
  ];
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log("⚙️  Settings");

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
