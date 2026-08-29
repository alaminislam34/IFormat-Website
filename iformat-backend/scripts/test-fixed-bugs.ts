import http from "node:http";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/token.js";
import { Role } from "@prisma/client";

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function runBugFixVerification() {
  console.log("🚀 Starting Test Server for Bug Fix Verification...");
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`✅ Test server running on http://localhost:${PORT}`);

  try {
    // Retry DB connect
    for (let i = 0; i < 5; i++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        console.log(`Retrying DB connection (${i + 1}/5)...`);
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    // 1. Setup or retrieve a test user
    const testEmail = `bugfix.test.${Date.now()}@iformat.io`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: "BugFix Tester",
        role: Role.CANDIDATE,
        passwordHash: "$2b$10$wE9aP.mockHashNotUsedDirectly123456",
        emailVerified: true,
      },
    });
    console.log(`👤 Created test user: ${user.email} with initial role: ${user.role}`);

    const token = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    // ================= TEST 1: POST /users/role persistence =================
    console.log("\n🧪 [TEST 1] Testing POST /users/role endpoint and DB persistence...");
    const roleRes = await fetch(`${BASE_URL}/users/role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: "EMPLOYER" }),
    });

    const roleData = await roleRes.json();
    console.log(`HTTP Status: ${roleRes.status}`, roleData);

    if (roleRes.status !== 200) {
      throw new Error(`Failed role update test with status ${roleRes.status}`);
    }

    // Verify directly in the database
    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    console.log(`🔍 Database verification: User role in DB is now -> ${updatedUser?.role}`);
    if (updatedUser?.role !== "EMPLOYER") {
      throw new Error(`Database persistence failed: expected EMPLOYER, got ${updatedUser?.role}`);
    }
    console.log("✅ TEST 1 PASSED: Role updated via POST and confirmed persisted in DB!");

    // ================= TEST 2: POST /ai/resume/optimize with FormData =================
    console.log("\n🧪 [TEST 2] Testing POST /ai/resume/optimize with FormData (Multipart)...");
    
    // First generate a valid ATS resume PDF using cv/build
    console.log("Generating genuine ATS PDF from /ai/cv/build first...");
    const cvRes = await fetch(`${BASE_URL}/ai/cv/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_info: { name: "Jane Developer", email: "jane@test.io" },
        raw_notes: "5 years building React, Node.js, and TypeScript web applications with PostgreSQL.",
        targetRole: "Senior Full Stack Engineer",
        targetIndustry: "Technology",
      }),
    });
    const cvData = await cvRes.json();
    const pdfBase64 = cvData.data?.pdfBase64 || cvData.pdfBase64;
    const pdfBuffer = Buffer.from(pdfBase64, "base64");

    // Now send the genuine PDF as FormData
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    formData.append("resume", blob, "jane_resume.pdf");
    formData.append("targetRole", "Staff Software Engineer");
    formData.append("targetIndustry", "Technology");
    formData.append("jobDescription", "Staff engineer with React, Next.js, and TypeScript.");

    const aiRes = await fetch(`${BASE_URL}/ai/resume/optimize`, {
      method: "POST",
      body: formData,
    });

    const aiData = await aiRes.json();
    console.log(`HTTP Status: ${aiRes.status}`);
    console.log("Optimized PDF returned:", aiData.data?.fileName || aiData.message || "OK");

    if (aiRes.status !== 200) {
      throw new Error(`Failed FormData resume optimization with status ${aiRes.status}`);
    }

    console.log("✅ TEST 2 PASSED: Multipart FormData upload to /ai/resume/optimize returned 200 OK!");

    // Cleanup test user
    await prisma.user.delete({ where: { id: user.id } });
    console.log("\n🧹 Test user cleaned up successfully.");
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runBugFixVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
