import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hash("admin123", 12);
  
  await prisma.user.upsert({
    where: { email: "admin@salesglider.com" },
    update: {},
    create: {
      email: "admin@salesglider.com",
      name: "Admin",
      password: adminPassword,
      role: "admin",
      companyName: "SalesGlider Growth Partners",
    },
  });

  console.log("Seed complete: admin@salesglider.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
