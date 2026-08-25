/**
 * Automated End-to-End API Health & Functional Test Runner
 * Hits all public and core API endpoints to verify live functionality.
 */

import http from "node:http";
import { app } from "../src/app.js";

const PORT = 5098;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

interface TestResult {
  module: string;
  endpoint: string;
  method: string;
  status: number;
  expectedStatus: number[];
  timeMs: number;
  passed: boolean;
  notes: string;
}

const results: TestResult[] = [];

async function makeRequest(
  method: string,
  path: string,
  body?: any,
  headers: Record<string, string> = {}
): Promise<{ status: number; data: any; timeMs: number }> {
  const start = Date.now();
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "follow",
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }

  const timeMs = Date.now() - start;
  return { status: res.status, data, timeMs };
}

async function runTest(
  module: string,
  endpoint: string,
  method: string,
  expectedStatus: number[],
  body?: any,
  headers?: Record<string, string>
) {
  try {
    const { status, data, timeMs } = await makeRequest(method, endpoint, body, headers);
    const passed = expectedStatus.includes(status);
    const notes = passed
      ? (data?.message || (typeof data === "object" ? "OK" : "Success"))
      : `Received ${status}, expected [${expectedStatus.join(", ")}]`;

    results.push({
      module,
      endpoint,
      method,
      status,
      expectedStatus,
      timeMs,
      passed,
      notes: typeof notes === "string" ? notes.slice(0, 45) : "OK",
    });
  } catch (err: any) {
    results.push({
      module,
      endpoint,
      method,
      status: 0,
      expectedStatus,
      timeMs: 0,
      passed: false,
      notes: `Err: ${err.message || err}`.slice(0, 45),
    });
  }
}

async function main() {
  console.log("\n🚀 Starting Test Server for End-to-End API Verification...");

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`✅ Test server active on port ${PORT}\n`);

  console.log("🔍 Running Comprehensive API Verification Suite...\n");

  // 1. System & Docs
  await runTest("System", "/health", "GET", [200]);
  await runTest("System", `http://localhost:${PORT}/`, "GET", [200]);
  await runTest("Docs", `http://localhost:${PORT}/api-docs.json`, "GET", [200]);
  await runTest("Docs", `http://localhost:${PORT}/api-docs/`, "GET", [200, 301, 302]);

  // 2. AI Career Tools
  await runTest("AI", "/ai/cover-letter", "POST", [200], {
    role: "Senior Full Stack Developer",
    company: "Vercel",
    experienceContext: "5 years of React, Next.js, Node.js and TypeScript expertise.",
    tone: "professional",
  });

  await runTest("AI", "/ai/email", "POST", [200], {
    recipientName: "Engineering Team",
    role: "Lead Backend Engineer",
    company: "Stripe",
    context: "Experienced in building high-throughput payment APIs.",
    tone: "formal",
  });

  await runTest("AI", "/ai/resume/optimize", "POST", [200], {
    rawText: "Built backend APIs and scaled Postgres database queries.",
    targetRole: "Senior Backend Engineer",
    industry: "Fintech",
  });

  // 3. Plans & Memberships
  await runTest("Plans", "/plans", "GET", [200]);

  // 4. Jobs & Consultations
  await runTest("Jobs", "/jobs", "GET", [200]);
  await runTest("Bookings", "/bookings/slots", "GET", [200]);

  // 5. Auth Validation Tests
  await runTest("Auth", "/auth/login", "POST", [400, 401], {
    email: "invalid-email-format",
    password: "123",
  });

  await runTest("Auth", "/auth/verify-otp", "POST", [400], {
    email: "test@example.com",
    otp: "12",
    type: "EMAIL_VERIFICATION",
  });

  // 6. Protected Route Guard Check
  await runTest("Auth Guard", "/auth/me", "GET", [401]);

  server.close();

  // Print Summary Table
  console.log("┌─────────────────┬────────┬───────────────────────────────┬────────┬──────────┬────────┐");
  console.log("│ Module          │ Method │ Endpoint                      │ Status │ Latency  │ Result │");
  console.log("├─────────────────┼────────┼───────────────────────────────┼────────┼──────────┼────────┐");

  let passCount = 0;
  for (const r of results) {
    const mod = r.module.padEnd(15);
    const meth = r.method.padEnd(6);
    const ep = (r.endpoint.replace(`http://localhost:${PORT}`, "")).slice(0, 29).padEnd(29);
    const stat = `${r.status}`.padEnd(6);
    const lat = `${r.timeMs}ms`.padEnd(8);
    const resIcon = r.passed ? "✅ PASS" : "❌ FAIL";
    if (r.passed) passCount++;

    console.log(`│ ${mod} │ ${meth} │ ${ep} │ ${stat} │ ${lat} │ ${resIcon} │`);
  }

  console.log("└─────────────────┴────────┴───────────────────────────────┴────────┴──────────┴────────┘\n");
  console.log(`📊 Summary: ${passCount}/${results.length} API checks passed (${((passCount / results.length) * 100).toFixed(0)}%)\n`);
}

main().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
