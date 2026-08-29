import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { signAccessToken } from "../src/utils/token.js";
import { Role } from "@prisma/client";

const BASE_URL = "http://localhost:5000/api/v1";

async function testScreeningAndApplicantsFlow() {
  console.log("==================================================");
  console.log("🎯 TESTING EMPLOYER APPLICANTS & AI SCREENING FLOW");
  console.log("==================================================\n");

  // 1. Setup Employer
  let employer = await prisma.user.findFirst({
    where: { role: Role.EMPLOYER, isDeleted: false },
  });
  if (!employer) {
    employer = await prisma.user.create({
      data: {
        email: "employer.screening.test@iformat.io",
        name: "Acme Tech Employer",
        role: Role.EMPLOYER,
        passwordHash: "hash123",
        emailVerified: true,
        companyName: "Acme Corp",
      },
    });
  }

  // Ensure employer has an active plan with aiScreeningEnabled
  let proPlan = await prisma.plan.findFirst({
    where: { targetAudience: "EMPLOYER", aiScreeningEnabled: true, isDeleted: false },
  });
  if (!proPlan) {
    proPlan = await prisma.plan.create({
      data: {
        code: "EMPLOYER_PRO_TEST",
        name: "Employer Pro",
        priceInCents: 4900,
        aiScreeningEnabled: true,
        unmaskedApplicantProfiles: true,
        targetAudience: "EMPLOYER",
      },
    });
  }

  await prisma.subscription.upsert({
    where: { userId: employer.id },
    create: {
      userId: employer.id,
      planId: proPlan.id,
      status: "ACTIVE",
      stripeCustomerId: `cus_${employer.id.slice(0, 10)}`,
    },
    update: {
      planId: proPlan.id,
      status: "ACTIVE",
    },
  });

  // 2. Setup Candidate
  let candidate = await prisma.user.findFirst({
    where: { role: Role.CANDIDATE, isDeleted: false },
  });
  if (!candidate) {
    candidate = await prisma.user.create({
      data: {
        email: "candidate.screening.test@iformat.io",
        name: "Jane Dev",
        role: Role.CANDIDATE,
        passwordHash: "hash123",
        emailVerified: true,
      },
    });
  }

  // 3. Setup Job
  let job = await prisma.jobPosting.findFirst({
    where: { employerId: employer.id, isDeleted: false },
  });
  if (!job) {
    job = await prisma.jobPosting.create({
      data: {
        employerId: employer.id,
        title: "Senior Full Stack Engineer",
        company: "Acme Corp",
        category: "Technology & Engineering",
        jobType: "Full Time",
        location: "Remote",
        description: "Looking for an expert TypeScript / Next.js developer with Node.js experience.",
        requirements: ["5+ years TypeScript", "React/Next.js", "PostgreSQL & Prisma"],
        responsibilities: ["Lead frontend architecture", "Build REST APIs"],
        status: "PUBLISHED",
      },
    });
  }

  // 4. Setup Candidate CV & Application
  let cv = await prisma.cV.findFirst({ where: { userId: candidate.id } });
  if (!cv) {
    cv = await prisma.cV.create({
      data: {
        userId: candidate.id,
        title: "Jane Dev - Senior Full Stack CV",
        versions: {
          create: {
            versionNumber: 1,
            content: {
              name: "Jane Dev",
              role: "Senior Full Stack Engineer",
              summary: "7+ years building enterprise web apps with TypeScript, React, Next.js, Node.js, and PostgreSQL.",
              skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "Prisma", "Node.js", "AWS", "GraphQL"],
              experience: [
                {
                  company: "Tech Corp",
                  role: "Staff Engineer",
                  years: "4 years",
                  description: "Built scalable Next.js and PostgreSQL backends handling 50k+ daily users.",
                },
                {
                  company: "Web Studio",
                  role: "Senior Frontend Engineer",
                  years: "3 years",
                  description: "Led development of high-performance React web applications.",
                },
              ],
              education: [
                {
                  degree: "B.S. in Computer Science",
                  school: "University of Tech",
                  year: "2018",
                },
              ],
            },
          },
        },
      },
    });
  }

  let application = await prisma.application.findFirst({
    where: { jobId: job.id, candidateId: candidate.id },
  });
  if (!application) {
    application = await prisma.application.create({
      data: {
        jobId: job.id,
        candidateId: candidate.id,
        cvId: cv.id,
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        coverNote: "Experienced Full Stack engineer with strong TypeScript, Next.js, and PostgreSQL background.",
        status: "SUBMITTED",
      },
    });
  } else if (!application.cvId) {
    application = await prisma.application.update({
      where: { id: application.id },
      data: { cvId: cv.id },
    });
  }

  const employerToken = signAccessToken({
    userId: employer.id,
    email: employer.email,
    role: employer.role,
    tokenVersion: employer.tokenVersion,
  });

  const employerHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${employerToken}`,
  };

  // Step 1: GET /api/v1/applications/job/:jobId (Employer views applicants list)
  console.log(`1️⃣ Fetching applicants for job '${job.title}' (jobId: ${job.id})...`);
  const listRes = await fetch(`${BASE_URL}/applications/job/${job.id}`, {
    headers: employerHeaders,
  });
  console.log(`   HTTP Status: ${listRes.status}`);
  const listData = await listRes.json();
  console.log(`   Found ${listData.data?.applications?.length || 0} applicants`);

  if (listRes.status !== 200) {
    throw new Error(`Failed to list applicants: ${JSON.stringify(listData)}`);
  }

  // Step 2: POST /api/v1/screening/:applicationId/rerun (Employer triggers AI Screening)
  console.log(`\n2️⃣ Triggering AI screening re-run for application ${application.id}...`);
  const screenRes = await fetch(`${BASE_URL}/screening/${application.id}/rerun`, {
    method: "POST",
    headers: employerHeaders,
  });
  console.log(`   HTTP Status: ${screenRes.status}`);
  const screenData = await screenRes.json();
  console.log("   AI Screening Result:", {
    score: screenData.data?.score,
    recommendation: screenData.data?.recommendation,
    summary: screenData.data?.summary,
    strengths: screenData.data?.strengths,
    gaps: screenData.data?.gaps,
  });

  if (screenRes.status !== 200 || typeof screenData.data?.score !== "number") {
    throw new Error(`Screening failed: ${JSON.stringify(screenData)}`);
  }
  console.log(`   ✅ AI Screening successfully computed score: ${screenData.data.score}% (${screenData.data.recommendation})`);

  // Step 3: GET /api/v1/screening/:applicationId (Employer views screening result)
  console.log(`\n3️⃣ Retrieving screening result via GET /api/v1/screening/${application.id}...`);
  const getScreenRes = await fetch(`${BASE_URL}/screening/${application.id}`, {
    headers: employerHeaders,
  });
  console.log(`   HTTP Status: ${getScreenRes.status}`);
  const getScreenData = await getScreenRes.json();

  if (getScreenRes.status !== 200 || getScreenData.data?.id !== screenData.data?.id) {
    throw new Error(`Screening fetch failed: ${JSON.stringify(getScreenData)}`);
  }
  console.log(`   ✅ Direct screening retrieval matched score: ${getScreenData.data.score}%`);

  // Step 4: PATCH /api/v1/applications/:applicationId/status (Employer shortlists candidate)
  console.log(`\n4️⃣ Updating applicant status to SHORTLISTED...`);
  const updateStatusRes = await fetch(`${BASE_URL}/applications/${application.id}/status`, {
    method: "PATCH",
    headers: employerHeaders,
    body: JSON.stringify({
      status: "SHORTLISTED",
      employerFeedback: "Strong match based on AI screening report.",
    }),
  });
  console.log(`   HTTP Status: ${updateStatusRes.status}`);
  const updateStatusData = await updateStatusRes.json();

  if (updateStatusRes.status !== 200 || updateStatusData.data?.status !== "SHORTLISTED") {
    throw new Error(`Status update failed: ${JSON.stringify(updateStatusData)}`);
  }
  console.log("   ✅ Application status successfully transitioned to SHORTLISTED!");

  await prisma.$disconnect();

  console.log("\n==================================================");
  console.log("🎉 ALL SCREENING & APPLICANT ROSTER E2E TESTS PASSED");
  console.log("==================================================");
}

testScreeningAndApplicantsFlow().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
