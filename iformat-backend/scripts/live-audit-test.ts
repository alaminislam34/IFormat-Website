import http from "node:http";
import { app } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/token.js";
import { Role } from "@prisma/client";

const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

export interface EndpointAuditResult {
  endpoint: string;
  method: string;
  module: string;
  description: string;
  status: number;
  expectedStatus: number[];
  timeMs: number;
  passed: boolean;
  responseShape: string;
  authRequired: boolean;
  notes: string;
}

const auditResults: EndpointAuditResult[] = [];

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
  });

  let data: any;
  const contentType = res.headers.get("content-type");
  try {
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch {
    data = null;
  }

  const timeMs = Date.now() - start;
  return { status: res.status, data, timeMs };
}

function getShape(data: any): string {
  if (data === null || data === undefined) return "null";
  if (typeof data === "string") return `string (${data.length} chars)`;
  if (typeof data === "number" || typeof data === "boolean") return typeof data;
  if (Array.isArray(data)) return `Array[${data.length}]`;
  if (typeof data === "object") {
    const keys = Object.keys(data).slice(0, 5).join(", ");
    return `{ ${keys}${Object.keys(data).length > 5 ? "..." : ""} }`;
  }
  return typeof data;
}

async function testEndpoint(
  module: string,
  method: string,
  path: string,
  description: string,
  expectedStatus: number[],
  authRequired: boolean,
  tokenProvider?: () => Promise<string> | string,
  body?: any
) {
  const headers: Record<string, string> = {};
  if (tokenProvider) {
    const token = typeof tokenProvider === "function" ? await tokenProvider() : tokenProvider;
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const { status, data, timeMs } = await makeRequest(method, path, body, headers);
    const passed = expectedStatus.includes(status);
    const shape = getShape(data);
    let note = "";
    if (status === 500) {
      note = `500 Server Error: ${data?.message || "Internal error"}`;
    } else if (status === 404) {
      note = `404 Not Found`;
    } else if (status === 401 && !authRequired) {
      note = `Unexpected 401`;
    } else if (status === 400) {
      note = `Validation 400: ${data?.message || JSON.stringify(data?.errors || "")}`;
    } else {
      note = data?.message || "OK";
    }

    auditResults.push({
      module,
      method,
      endpoint: path,
      description,
      status,
      expectedStatus,
      timeMs,
      passed,
      responseShape: shape,
      authRequired,
      notes: typeof note === "string" ? note.slice(0, 50) : "OK",
    });
  } catch (err: any) {
    auditResults.push({
      module,
      method,
      endpoint: path,
      description,
      status: 0,
      expectedStatus,
      timeMs: 0,
      passed: false,
      responseShape: "Network Error",
      authRequired,
      notes: `Err: ${err.message || err}`.slice(0, 50),
    });
  }
}

async function runFullAudit() {
  console.log("⚡ Starting Audit Test Server...");
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`✅ Running on http://localhost:${PORT}`);

  // Fetch or create mock users in DB to get real token testing
  let adminUser = await prisma.user.findFirst({ where: { role: Role.ADMIN, isDeleted: false } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "test.admin.audit@iformat.io",
        name: "Audit Admin",
        passwordHash: "$2b$10$wE9aP.mockHashNotUsedDirectly123456",
        role: Role.ADMIN,
        emailVerified: true,
      },
    });
  }

  let employerUser = await prisma.user.findFirst({ where: { role: Role.EMPLOYER, isDeleted: false } });
  if (!employerUser) {
    employerUser = await prisma.user.create({
      data: {
        email: "test.employer.audit@iformat.io",
        name: "Audit Employer",
        companyName: "Audit Corp",
        passwordHash: "$2b$10$wE9aP.mockHashNotUsedDirectly123456",
        role: Role.EMPLOYER,
        emailVerified: true,
      },
    });
  }

  let candidateUser = await prisma.user.findFirst({ where: { role: Role.CANDIDATE, isDeleted: false } });
  if (!candidateUser) {
    candidateUser = await prisma.user.create({
      data: {
        email: "test.candidate.audit@iformat.io",
        name: "Audit Candidate",
        passwordHash: "$2b$10$wE9aP.mockHashNotUsedDirectly123456",
        role: Role.CANDIDATE,
        emailVerified: true,
      },
    });
  }

  const getAdminToken = async () => {
    const u = await prisma.user.findUnique({ where: { id: adminUser!.id } });
    return signAccessToken({
      userId: u!.id,
      email: u!.email,
      role: u!.role,
      tokenVersion: u!.tokenVersion,
    });
  };

  const getEmployerToken = async () => {
    const u = await prisma.user.findUnique({ where: { id: employerUser!.id } });
    return signAccessToken({
      userId: u!.id,
      email: u!.email,
      role: u!.role,
      tokenVersion: u!.tokenVersion,
    });
  };

  const getCandidateToken = async () => {
    const u = await prisma.user.findUnique({ where: { id: candidateUser!.id } });
    return signAccessToken({
      userId: u!.id,
      email: u!.email,
      role: u!.role,
      tokenVersion: u!.tokenVersion,
    });
  };

  console.log("🔑 Initialized dynamic token providers for Admin, Employer, Candidate");

  // ================= SYSTEM & DOCS =================
  await testEndpoint("System", "GET", "/health", "Process liveness probe", [200], false);
  await testEndpoint("System", "GET", "/health/ready", "Database readiness probe", [200], false);
  await testEndpoint("System", "GET", `http://localhost:${PORT}/`, "API root info", [200], false);
  await testEndpoint("System", "GET", `http://localhost:${PORT}/health`, "Root health check", [200], false);
  await testEndpoint("Docs", "GET", `http://localhost:${PORT}/api-docs.json`, "OpenAPI Swagger JSON spec", [200], false);

  // ================= AUTH MODULE =================
  await testEndpoint("Auth", "POST", "/auth/register", "User registration validation", [201, 400, 409], false, undefined, {
    name: "Audit New User",
    email: `audit.user.${Date.now()}@example.com`,
    password: "Password123!",
  });
  await testEndpoint("Auth", "POST", "/auth/login", "User login credentials verification", [200, 400, 401], false, undefined, {
    email: "nonexistent.user@example.com",
    password: "WrongPassword123!",
  });
  await testEndpoint("Auth", "POST", "/auth/verify-otp", "Verify 6-digit OTP code", [200, 400, 404], false, undefined, {
    email: "test.candidate.audit@iformat.io",
    code: "999999",
    type: "EMAIL_VERIFICATION",
  });
  await testEndpoint("Auth", "POST", "/auth/resend-otp", "Resend 6-digit OTP code", [200, 400, 404], false, undefined, {
    email: "test.candidate.audit@iformat.io",
    type: "EMAIL_VERIFICATION",
  });
  await testEndpoint("Auth", "POST", "/auth/forgot-password", "Request password reset OTP/link", [200, 400], false, undefined, {
    email: "test.candidate.audit@iformat.io",
  });
  await testEndpoint("Auth", "POST", "/auth/reset-password", "Set new password via OTP or token", [200, 400], false, undefined, {
    email: "test.candidate.audit@iformat.io",
    code: "000000",
    password: "BrandNewPassword123!",
  });
  await testEndpoint("Auth", "POST", "/auth/refresh", "Refresh access token via refresh token", [200, 400, 401], false, undefined, {
    refreshToken: "invalid-refresh-token",
  });
  await testEndpoint("Auth", "GET", "/auth/me", "Get current user profile (Unauthenticated)", [401], true);
  await testEndpoint("Auth", "GET", "/auth/me", "Get current user profile (Authenticated)", [200], true, getCandidateToken);
  await testEndpoint("Auth", "POST", "/auth/change-password", "Change password authenticated (invalid current password test)", [200, 400, 401], true, getCandidateToken, {
    currentPassword: "WrongCurrentPassword123!",
    newPassword: "NewSuperPassword123!",
  });

  // ================= USERS MODULE =================
  await testEndpoint("Users", "GET", "/users/me", "Get current user profile", [200], true, getCandidateToken);
  await testEndpoint("Users", "PATCH", "/users/me", "Update personal profile", [200, 400], true, getCandidateToken, {
    name: "Updated Candidate Name",
  });
  await testEndpoint("Users", "POST", "/users/role", "Set/update user role", [200, 400], true, getCandidateToken, {
    role: "CANDIDATE",
  });
  await testEndpoint("Users", "POST", "/users/company", "Create company profile", [200, 400], true, getEmployerToken, {
    companyName: "Audited Tech Ltd",
    companyWebsite: "https://auditedtech.com",
    companyDescription: "Leading enterprise QA solutions",
  });
  await testEndpoint("Users", "PATCH", "/users/company", "Update company profile", [200, 400], true, getEmployerToken, {
    companyName: "Audited Tech Ltd Updated",
  });

  // ================= CV MODULE =================
  await testEndpoint("CV", "GET", "/cv", "List candidate's CVs", [200], true, getCandidateToken);
  await testEndpoint("CV", "POST", "/cv", "Create new CV", [201, 200, 400], true, getCandidateToken, {
    title: "Audit Resume 2026",
    content: { summary: "Senior QA Engineer with 5+ years experience" },
  });
  const candidateCV = await prisma.cV.findFirst({ where: { userId: candidateUser.id } });
  if (candidateCV) {
    await testEndpoint("CV", "GET", `/cv/${candidateCV.id}`, "Get single CV details", [200], true, getCandidateToken);
    await testEndpoint("CV", "POST", `/cv/${candidateCV.id}/versions`, "Save new CV version", [201, 200], true, getCandidateToken, {
      content: { summary: "Updated summary version 2" },
    });
    await testEndpoint("CV", "DELETE", `/cv/${candidateCV.id}`, "Delete CV", [200], true, getCandidateToken);
  }

  // ================= PLANS MODULE =================
  await testEndpoint("Plans", "GET", "/plans", "Public membership plans list", [200], false);
  const samplePlan = await prisma.plan.findFirst();
  if (samplePlan) {
    await testEndpoint("Plans", "GET", `/plans/${samplePlan.id}`, "Get single plan by ID", [200], false);
    await testEndpoint("Plans", "GET", `/plans/${samplePlan.code}`, "Get single plan by code", [200], false);
  }
  await testEndpoint("Plans", "POST", "/plans", "Create plan (Admin)", [201, 200, 400], true, getAdminToken, {
    code: `TEST_${Date.now()}`,
    name: "Test Audit Plan",
    priceInCents: 1900,
    currency: "USD",
    billingInterval: "MONTHLY",
    targetAudience: "CANDIDATE",
  });

  // ================= JOBS MODULE =================
  await testEndpoint("Jobs", "GET", "/jobs", "Public browse job board", [200], false);
  await testEndpoint("Jobs", "GET", "/jobs/employer/mine", "Employer list own job posts", [200], true, getEmployerToken);
  const sampleJob = await prisma.jobPosting.findFirst({ where: { isDeleted: false } });
  if (sampleJob) {
    await testEndpoint("Jobs", "GET", `/jobs/${sampleJob.id}`, "Get single job details", [200], false);
  }
  await testEndpoint("Jobs", "POST", "/jobs", "Employer create job posting", [201, 200, 400, 403], true, getEmployerToken, {
    title: "Staff Software Engineer",
    company: "Audit Corp",
    category: "Engineering",
    jobType: "Full-Time",
    workplaceType: "Remote",
    location: "London, UK",
    salary: "$120,000 - $150,000",
    description: "Looking for top-tier software engineers with TypeScript experience.",
    requirements: ["5+ years TypeScript", "Next.js", "PostgreSQL"],
  });

  // ================= APPLICATIONS MODULE =================
  await testEndpoint("Applications", "GET", "/applications/mine", "Candidate list submitted applications", [200], true, getCandidateToken);
  if (sampleJob) {
    await testEndpoint("Applications", "POST", "/applications", "Candidate apply to job", [201, 200, 400, 409], true, getCandidateToken, {
      jobId: sampleJob.id,
      candidateName: "Audit Candidate",
      candidateEmail: "test.candidate.audit@iformat.io",
      coverNote: "Excited to apply for this role!",
    });
    await testEndpoint("Applications", "GET", `/applications/job/${sampleJob.id}`, "Employer view applicants for job", [200, 403], true, getEmployerToken);
  }

  // ================= SCREENING MODULE =================
  const sampleApp = await prisma.application.findFirst();
  if (sampleApp) {
    await testEndpoint("Screening", "GET", `/screening/${sampleApp.id}`, "Employer get AI screening score", [200, 403, 404], true, getEmployerToken);
    await testEndpoint("Screening", "POST", `/screening/${sampleApp.id}/rerun`, "Employer rerun AI screening", [200, 403, 404], true, getEmployerToken);
  }

  // ================= BOOKINGS MODULE =================
  await testEndpoint("Bookings", "GET", "/bookings/slots", "Public available consultation slots", [200], false);
  await testEndpoint("Bookings", "GET", "/bookings/mine", "Candidate list booked consultations", [200], true, getCandidateToken);
  await testEndpoint("Bookings", "POST", "/bookings/slots", "Create consultation slot (Employer/Admin)", [201, 200, 400], true, getEmployerToken, {
    title: "1-on-1 Career Strategy Consultation",
    startTime: new Date(Date.now() + 86400000).toISOString(),
    endTime: new Date(Date.now() + 90000000).toISOString(),
    priceInCents: 4900,
  });

  // ================= PAYMENTS MODULE =================
  await testEndpoint("Payments", "GET", "/payments/subscription", "Get user active subscription", [200], true, getCandidateToken);
  if (samplePlan) {
    await testEndpoint("Payments", "POST", "/payments/checkout", "Create Stripe checkout session", [200, 400], true, getCandidateToken, {
      planId: samplePlan.id,
      successUrl: "http://localhost:3000/dashboard/billing?payment=success",
      cancelUrl: "http://localhost:3000/services?payment=cancelled",
    });
  }
  await testEndpoint("Payments", "POST", "/payments/customer-portal", "Create Stripe customer portal link", [200, 400], true, getCandidateToken, {
    returnUrl: "http://localhost:3000/dashboard/billing",
  });
  await testEndpoint("Payments", "POST", "/payments/subscription/cancel", "Cancel active subscription", [200, 400, 404], true, getCandidateToken, {
    reason: "Testing cancel flow",
  });
  await testEndpoint("Payments", "POST", "/payments/subscription/resume", "Resume cancelled subscription", [200, 400, 404], true, getCandidateToken);

  // ================= NOTIFICATIONS MODULE =================
  await testEndpoint("Notifications", "GET", "/notifications", "Get my in-app notifications", [200], true, getCandidateToken);
  await testEndpoint("Notifications", "POST", "/notifications/read-all", "Mark all notifications read", [200], true, getCandidateToken);

  // ================= ADMIN MODULE =================
  await testEndpoint("Admin", "GET", "/admin/metrics", "Admin dashboard KPIs & MRR", [200], true, getAdminToken);
  await testEndpoint("Admin", "GET", "/admin/users", "Admin list all platform users", [200], true, getAdminToken);
  await testEndpoint("Admin", "GET", "/admin/jobs", "Admin list all jobs", [200], true, getAdminToken);
  await testEndpoint("Admin", "PATCH", `/admin/users/${candidateUser.id}/ban`, "Admin ban/unban user", [200], true, getAdminToken, {
    isBanned: false,
    reason: "Audit test unban",
  });
  await testEndpoint("Admin", "POST", `/admin/users/${candidateUser.id}/verify-email`, "Admin force verify email", [200], true, getAdminToken);
  await testEndpoint("Admin", "PATCH", `/admin/companies/${employerUser.id}/verify`, "Admin toggle company verification", [200], true, getAdminToken, {
    isVerifiedCompany: true,
  });
  if (samplePlan) {
    await testEndpoint("Admin", "POST", "/admin/subscriptions/override", "Admin grant manual subscription", [200, 400], true, getAdminToken, {
      userId: candidateUser.id,
      planId: samplePlan.id,
      durationDays: 30,
    });
  }
  await testEndpoint("Admin", "GET", "/admin/audit-logs", "Admin list audit activity logs", [200], true, getAdminToken);

  // ================= AI MODULE =================
  await testEndpoint("AI", "POST", "/ai/cover-letter", "AI Generate Tailored Cover Letter", [200], false, undefined, {
    role: "Senior Full Stack Developer",
    company: "Vercel Inc",
    jobDescription: "Next.js, TypeScript, and React architecture.",
    tone: "professional",
  });
  await testEndpoint("AI", "POST", "/ai/email", "AI Generate Outreach Cold Email", [200], false, undefined, {
    role: "Engineering Manager",
    company: "Stripe",
    recipient: "Hiring Lead",
    context: "Senior developer with payment integrations expertise.",
    tone: "Professional",
  });
  await testEndpoint("AI", "POST", "/ai/cv/build", "AI CV Builder from Raw Notes", [200], false, undefined, {
    targetRole: "Full Stack Engineer",
    targetIndustry: "Software & Technology",
    raw_notes: "5 years building Node.js microservices and React web applications.",
  });
  await testEndpoint("AI", "POST", "/ai/recommend", "AI Product / Package Recommender", [200], false, undefined, {
    job_title: "Full Stack Developer",
    experience_level: "Senior",
    career_goals: "Accelerate career to Engineering Leadership",
    industry: "Tech",
  });
  await testEndpoint("AI", "POST", "/ai/chat", "AI Career Advisor Chatbot", [200], false, undefined, {
    query: "How should I structure my tech resume for senior engineering roles?",
  });

  // Test logout at the very end
  await testEndpoint("Auth", "POST", "/auth/logout", "Logout user session", [200], true, getCandidateToken);

  server.close();
  await prisma.$disconnect();

  console.log("\n========================================================");
  console.log("🏁 LIVE AUDIT TEST COMPLETE");
  console.log(`Total Endpoints Tested: ${auditResults.length}`);
  const passCount = auditResults.filter((r) => r.passed).length;
  console.log(`Passed: ${passCount} | Failed: ${auditResults.length - passCount}`);
  console.log("========================================================\n");

  console.log(JSON.stringify(auditResults, null, 2));
}

runFullAudit().catch((err) => {
  console.error("Audit run error:", err);
  process.exit(1);
});
