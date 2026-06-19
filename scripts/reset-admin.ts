import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@mbndemo.com";
  const password = "Admin2024!";
  const hash = await bcrypt.hash(password, 12);
  const u = await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: { email, passwordHash: hash },
  });
  console.log("✅ Admin:", u.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
