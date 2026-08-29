import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/token.js";
import { Role } from "@prisma/client";

const BASE_URL = "http://localhost:5000/api/v1";

async function testSettingsRoundTrip() {
  console.log("==================================================");
  console.log("⚙️ TESTING ADMIN SETTINGS END-TO-END ROUND TRIP");
  console.log("==================================================\n");

  // 1. Get or create Admin user
  let admin = await prisma.user.findFirst({ where: { role: Role.ADMIN, isDeleted: false } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin.settings.test@iformat.io",
        name: "Admin Tester",
        role: Role.ADMIN,
        passwordHash: "hash123",
        emailVerified: true,
      },
    });
  }

  const token = signAccessToken({
    userId: admin.id,
    email: admin.email,
    role: admin.role,
    tokenVersion: admin.tokenVersion,
  });

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // Step 1: GET initial settings
  console.log("1️⃣ Fetching current settings via GET /api/v1/admin/settings...");
  const getRes1 = await fetch(`${BASE_URL}/admin/settings`, { headers: authHeaders });
  console.log(`   HTTP Status: ${getRes1.status}`);
  const getData1 = await getRes1.json();
  console.log("   Initial Settings:", getData1.data);

  if (getRes1.status !== 200) {
    throw new Error(`GET /admin/settings returned ${getRes1.status}`);
  }

  // Step 2: Update AI_MODEL_PREFERENCE to "claude-3-5-sonnet"
  console.log("\n2️⃣ Updating setting via PATCH /api/v1/admin/settings (AI_MODEL_PREFERENCE -> 'claude-3-5-sonnet')...");
  const patchRes = await fetch(`${BASE_URL}/admin/settings`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({
      settings: {
        AI_MODEL_PREFERENCE: "claude-3-5-sonnet",
        DEFAULT_MATCH_THRESHOLD: "85",
      },
    }),
  });
  console.log(`   HTTP Status: ${patchRes.status}`);
  const patchData = await patchRes.json();
  console.log("   Updated Response:", patchData.data);

  if (patchRes.status !== 200) {
    throw new Error(`PATCH /admin/settings returned ${patchRes.status}`);
  }

  // Step 3: Fetch again to simulate page refresh
  console.log("\n3️⃣ Simulating page reload: fetching settings via GET /api/v1/admin/settings...");
  const getRes2 = await fetch(`${BASE_URL}/admin/settings`, { headers: authHeaders });
  const getData2 = await getRes2.json();
  console.log("   Fetched Settings on Reload:", getData2.data);

  if (getData2.data?.AI_MODEL_PREFERENCE !== "claude-3-5-sonnet") {
    throw new Error(
      `Persistence mismatch: expected 'claude-3-5-sonnet', got '${getData2.data?.AI_MODEL_PREFERENCE}'`
    );
  }
  console.log("   ✅ API returns persisted value 'claude-3-5-sonnet'!");

  // Step 4: Verify directly in PostgreSQL DB
  console.log("\n4️⃣ Direct Database Verification via Prisma...");
  const dbRecord = await prisma.systemSetting.findUnique({
    where: { key: "AI_MODEL_PREFERENCE" },
  });
  console.log("   DB Record in PostgreSQL:", dbRecord);

  if (!dbRecord || dbRecord.value !== "claude-3-5-sonnet") {
    throw new Error(`DB verification failed: ${JSON.stringify(dbRecord)}`);
  }
  console.log(`   ✅ Confirmed record in RDS PostgreSQL with updatedBy: ${dbRecord.updatedById}`);

  await prisma.$disconnect();

  console.log("\n==================================================");
  console.log("🎉 ALL ADMIN SETTINGS E2E TESTS PASSED SUCCESSFULLY");
  console.log("==================================================");
}

testSettingsRoundTrip().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
