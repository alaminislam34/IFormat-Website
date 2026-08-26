import { AIClient } from "../src/lib/ai-client.js";

async function runAITests() {
  console.log("==================================================");
  console.log("🧪 TESTING ALL 7 AI MICROSERVICE ENDPOINTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // 1. Cover Letter
  try {
    console.log("1️⃣ Testing POST /api/v1/ai/cover-letter...");
    const res = await AIClient.generateCoverLetter({
      candidateProfile: {
        name: "Alex Morgan",
        experienceYears: 5,
        skills: ["React", "TypeScript", "Node.js"],
      },
      role: "Senior Full Stack Engineer",
      company: "Stripe",
      recipient: "Hiring Manager",
      jobDescription: "Looking for an engineer with strong Next.js and PostgreSQL skills.",
      tone: "professional",
    });
    console.log(`   ✅ Success! Model: ${res.model}, Tokens: ${res.tokensUsed}`);
    console.log(`   📝 Letter preview: ${res.letter.slice(0, 100)}...\n`);
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed Cover Letter test:", error.message || error);
    failed++;
  }

  // 2. Cold Email
  try {
    console.log("2️⃣ Testing POST /api/v1/ai/email...");
    const res = await AIClient.generateColdEmail({
      recipient: "Sarah Connor",
      role: "Engineering Director",
      company: "Vercel",
      context: "Extensive background building distributed web apps.",
      tone: "Confident",
    });
    console.log(`   ✅ Success! Model: ${res.model}, Tokens: ${res.tokensUsed}`);
    console.log(`   📝 Email preview: ${res.email.slice(0, 100)}...\n`);
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed Cold Email test:", error.message || error);
    failed++;
  }

  // 3. Candidate Screening
  try {
    console.log("3️⃣ Testing POST /api/v1/ai/screen...");
    const res = await AIClient.screenCandidate({
      user_info: {
        fullName: "Jane Doe",
        email: "jane@example.com",
        experience: "4 years as full stack engineer",
        education: "BS in Computer Science",
        skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
      },
      cv_json: {
        personal: { name: "Jane Doe", email: "jane@example.com" },
        experiences: [
          { company: "Tech Corp", role: "Senior Developer", description: "Built scalable backend services in Node.js and Postgres." }
        ],
        education: [
          { institution: "State University", degree: "BS CS" }
        ],
        skills: ["React", "Node.js", "PostgreSQL"],
      },
      job_description: "Senior Full Stack Developer needed with 3+ years in React, Node.js, and SQL databases.",
    });
    console.log(`   ✅ Success! Score: ${res.score}/100, Rec: ${res.recommendation.slice(0, 80)}...`);
    console.log(`   📊 Breakdown: ${JSON.stringify(res.scoreBreakdown)}`);
    console.log(`   🔎 Evidence count: ${res.evidence?.length || 0}\n`);
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed Screening test:", error.message || error);
    failed++;
  }

  // 4. CV Builder
  let builtPdfBase64 = "";
  try {
    console.log("4️⃣ Testing POST /api/v1/ai/cv/build...");
    const res = await AIClient.buildCV({
      user_info: {
        name: "Michael Scott",
        email: "michael@dundermifflin.com",
        phone: "+1 555-0199",
      },
      raw_notes: "Regional manager with 15 years sales leadership, top branch revenue, client retention. Managed a team of 15 account reps.",
      targetRole: "Regional Sales Director",
      targetIndustry: "Paper & Corporate Supplies",
      jobDescription: "Leading large B2B sales teams.",
    });
    builtPdfBase64 = res.pdfBase64;
    console.log(`   ✅ Success! PDF Base64 length: ${res.pdfBase64?.length || 0} chars`);
    console.log(`   📄 Output File: ${res.fileName}\n`);
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed CV Builder test:", error.message || error);
    failed++;
  }

  // 5. Resume Optimizer (using the valid PDF from CV Builder)
  if (builtPdfBase64) {
    try {
      console.log("5️⃣ Testing POST /api/v1/ai/resume/optimize...");
      const pdfBuffer = Buffer.from(builtPdfBase64, "base64");
      const res = await AIClient.optimizeResume({
        resumeBuffer: pdfBuffer,
        fileName: "michael_resume.pdf",
        targetRole: "VP of Enterprise Sales",
        targetIndustry: "Corporate Solutions",
        jobDescription: "Executive VP needed to drive nationwide enterprise sales quotas.",
      });
      console.log(`   ✅ Success! Optimized PDF returned (${res.pdfBase64?.length || 0} base64 chars)`);
      console.log(`   📝 Summary: ${res.summary.slice(0, 100)}...\n`);
      passed++;
    } catch (error: any) {
      console.error("   ❌ Failed Resume Optimizer test:", error.message || error);
      failed++;
    }
  }

  // 6. Product Recommender
  try {
    console.log("6️⃣ Testing POST /api/v1/ai/recommend...");
    const res = await AIClient.recommendProducts({
      job_title: "Full Stack Engineer",
      experience_level: "Senior",
      career_goals: "Become a Principal Architect at a Tier 1 tech company.",
      skills: ["React", "Go", "Kubernetes", "PostgreSQL"],
      industry: "Fintech",
      productCatalog: [
        {
          productId: "prod_pro_1",
          name: "Executive Architecture Mentorship",
          description: "1-on-1 coaching for senior engineers aiming for staff/principal roles.",
        },
        {
          productId: "prod_pro_2",
          name: "ATS Resume Polish & Screening Guarantee",
          description: "Full resume transformation with interview placement guarantee.",
        },
      ],
    });
    console.log(`   ✅ Success! Found ${res.recommendations?.length || 0} recommendations:`);
    res.recommendations?.forEach((r) => {
      console.log(`      - ${r.name} (${r.fitScore}%) -> ${r.reason.slice(0, 80)}...`);
    });
    console.log();
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed Product Recommender test:", error.message || error);
    failed++;
  }

  // 7. Career Advisor Chat
  try {
    console.log("7️⃣ Testing POST /api/v1/ai/chat...");
    const res = await AIClient.queryCareerAdvisor({
      query: "How can I negotiate a higher equity offer for a senior engineering role?",
      user_info: {
        name: "Alex",
        role: "Senior Engineer",
      },
      chat_history: [
        { role: "user", content: "I got an offer from a fintech startup." },
        { role: "assistant", content: "Congratulations! What is the breakdown of salary vs equity?" },
      ],
    });
    console.log(`   ✅ Success! Model: ${res.model}, Tokens: ${res.tokensUsed}`);
    console.log(`   🤖 Advisor response: ${res.response.slice(0, 120)}...\n`);
    passed++;
  } catch (error: any) {
    console.error("   ❌ Failed Career Chat test:", error.message || error);
    failed++;
  }

  console.log("==================================================");
  console.log(`🏁 ALL TESTS COMPLETED: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
}

runAITests().catch((err) => {
  console.error("Fatal error during AI test run:", err);
  process.exit(1);
});
