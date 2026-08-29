import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/token.js";
import { Role } from "@prisma/client";

const BASE_URL = "http://localhost:5000/api/v1";

async function testAdminPlanCRUD() {
  console.log("==================================================");
  console.log("TESTING ADMIN PLAN CREATION & UPDATE (E2E)");
  console.log("==================================================");

  let admin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: `admin_plan_test_${Date.now()}@iformat.com`,
        passwordHash: "hash123",
        role: Role.ADMIN,
        name: "Plan Admin Tester",
        emailVerified: true,
      },
    });
  }

  const token = signAccessToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    tokenVersion: 0,
  });

  const testPlanCode = `TEST_TIER_${Date.now().toString().slice(-6)}`;

  // 1. Create Plan (POST /api/v1/plans)
  console.log(`\n1. Creating test plan with code: ${testPlanCode}...`);
  const createRes = await fetch(`${BASE_URL}/plans`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      code: testPlanCode,
      name: "Automated Test Growth Tier",
      description: "Plan created via automated test suite",
      priceInCents: 4900,
      currency: "USD",
      billingInterval: "MONTHLY",
      targetAudience: "EMPLOYER",
      maxActiveJobs: 15,
      maxApplicationsPerMonth: 150,
      aiScreeningEnabled: true,
      featuredJobPlacement: true,
      unmaskedApplicantProfiles: true,
      unlimitedCvTemplates: true,
      consultationDiscountPercent: 10,
    }),
  });

  const createJson: any = await createRes.json();
  console.log("   Status:", createRes.status);
  console.log("   Created Plan ID:", createJson.data?.id);
  if (createRes.status !== 201) {
    throw new Error(`Failed to create plan: ${JSON.stringify(createJson)}`);
  }

  const createdId = createJson.data.id;

  // 2. Update Plan (PATCH /api/v1/plans/:id)
  console.log(`\n2. Updating plan ${createdId}...`);
  const updateRes = await fetch(`${BASE_URL}/plans/${createdId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Updated Growth Tier",
      priceInCents: 5900,
      maxActiveJobs: 25,
      isActive: false,
    }),
  });

  const updateJson: any = await updateRes.json();
  console.log("   Status:", updateRes.status);
  console.log("   Updated Name:", updateJson.data?.name);
  console.log("   Updated Price:", updateJson.data?.priceInCents);
  console.log("   Updated isActive:", updateJson.data?.isActive);

  if (updateRes.status !== 200) {
    throw new Error(`Failed to update plan: ${JSON.stringify(updateJson)}`);
  }

  // 3. Clean up test plan
  console.log("\n3. Cleaning up test plan from database...");
  await prisma.plan.delete({ where: { id: createdId } });
  console.log("   ✅ Cleaned up test plan record");

  console.log("\n==================================================");
  console.log("🎉 ALL ADMIN PLAN CRUD TESTS PASSED SUCCESSFULLY");
  console.log("==================================================");
}

testAdminPlanCRUD()
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
