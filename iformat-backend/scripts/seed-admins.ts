import "dotenv/config";
import { seedDatabase } from "../src/lib/seed.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  console.log("=========================================");
  console.log("🌱 RUNNING IFORMAT DATABASE SEED SCRIPT");
  console.log("=========================================");

  await seedDatabase();

  console.log("\n🔍 Verifying Admin Accounts in Database:");
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", isDeleted: false },
    select: { id: true, email: true, name: true, role: true, emailVerified: true },
  });

  console.table(admins);

  await prisma.$disconnect();
  console.log("\n✅ Database seed & admin verification completed successfully!");
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
