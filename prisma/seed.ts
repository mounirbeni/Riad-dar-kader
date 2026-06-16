import { PrismaClient } from "@prisma/client";
import { runSeed } from "@/lib/seed-core";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Mbn Riad…");
  const summary = await runSeed(prisma);
  console.log(`👤 Admin: ${summary.admin}`);
  console.log(`🛏️  ${summary.rooms} rooms`);
  console.log(`✨ ${summary.extras} extras`);
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
