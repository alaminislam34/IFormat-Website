import { prisma } from "../src/lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany({
    where: { companyVideoUrl: { not: null } },
    select: { id: true, email: true, companyName: true, companyVideoUrl: true }
  });
  console.log("Users with companyVideoUrl:\n", JSON.stringify(users, null, 2));

  const allEmployers = await prisma.user.findMany({
    where: { role: "EMPLOYER" },
    select: { id: true, email: true, companyName: true, companyVideoUrl: true }
  });
  console.log("All Employers:\n", JSON.stringify(allEmployers, null, 2));
}

main().finally(() => prisma.$disconnect());
