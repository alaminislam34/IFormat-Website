import { AIClient } from "../../lib/ai-client.js";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { NotFoundError, InternalServerError } from "../../errors/index.js";
import { isUsableResumeContent, buildScreeningCvJson } from "../cv/cv-content.js";
import {
  GenerateCoverLetterInput,
  GenerateEmailInput,
  OptimizeResumeInput,
  BuildCvInput,
  RecommendProductsInput,
  CareerChatInput,
  AnalyzeJobFitInput,
} from "./ai.validation.js";

/** Accounts allowed to see the raw AI request/response in the job analyzer. */
const RAW_AI_DATA_EMAILS = ["alaminislam15941@gmail.com"];

function canSeeRawAiData(email?: string | null) {
  return !!email && RAW_AI_DATA_EMAILS.includes(email.toLowerCase());
}

export class AIService {
  /**
   * Generates a tailored, professional Cover Letter via FastAPI Bedrock service
   */
  static async generateCoverLetter(input: GenerateCoverLetterInput, userId?: string) {
    logger.info(`🤖 Generating AI Cover Letter for ${input.role} at ${input.company}`);

    // If candidateProfile is not explicitly passed, try to fetch from DB user record
    let candidateProfile = input.candidateProfile;
    if (!candidateProfile && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          companyDescription: true,
        },
      });
      if (user) {
        candidateProfile = user;
      }
    }

    if (!candidateProfile || Object.keys(candidateProfile).length === 0) {
      candidateProfile = {
        name: "Candidate",
        role: input.role,
        skills: ["Communication", "Problem Solving", "Collaboration"],
      };
    }

    const jobDescription = input.jobDescription || input.experienceContext || `Role: ${input.role} at ${input.company}`;

    const response = await AIClient.generateCoverLetter({
      candidateProfile,
      role: input.role,
      company: input.company,
      recipient: input.recipient || "Hiring Manager",
      jobDescription,
      tone: input.tone || "professional",
    });

    return response;
  }

  /**
   * Generates a high-converting Cold Outreach / Job Application Email
   */
  static async generateEmail(input: GenerateEmailInput) {
    const recipient = input.recipient || input.recipientName || "Hiring Manager";
    logger.info(`🤖 Generating AI Outreach Email for ${input.role} at ${input.company} to ${recipient}`);

    const response = await AIClient.generateColdEmail({
      recipient,
      role: input.role,
      company: input.company,
      context: input.context || `Reaching out regarding open ${input.role} opportunities.`,
      tone: input.tone || "Professional",
    });

    return response;
  }

  /**
   * Optimizes uploaded PDF resume using AI and returns Base64 PDF + summary
   */
  static async optimizeResume(
    input: OptimizeResumeInput,
    fileBuffer: Buffer,
    fileName: string = "resume.pdf"
  ) {
    logger.info(`🤖 Optimizing resume PDF for role: ${input.targetRole} (${fileName})`);

    const response = await AIClient.optimizeResume({
      resumeBuffer: fileBuffer,
      fileName,
      targetRole: input.targetRole,
      targetIndustry: input.targetIndustry,
      jobDescription: input.jobDescription,
    });

    return response;
  }

  /**
   * Builds an ATS-compliant CV and PDF from raw notes and user info
   */
  static async buildCV(input: BuildCvInput, userId?: string) {
    logger.info(`🤖 Building ATS CV for target role: ${input.targetRole}`);

    let userInfo = input.user_info;
    if (!userInfo && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          companyDescription: true,
        },
      });
      if (user) {
        userInfo = user;
      }
    }

    if (!userInfo || Object.keys(userInfo).length === 0) {
      userInfo = {
        name: "Candidate Profile",
        targetRole: input.targetRole,
        targetIndustry: input.targetIndustry,
      };
    }

    const response = await AIClient.buildCV({
      user_info: userInfo,
      raw_notes: input.raw_notes,
      targetRole: input.targetRole,
      targetIndustry: input.targetIndustry,
      jobDescription: input.jobDescription,
    });

    return response;
  }

  /**
   * Recommends iFormat products/packages matching candidate profile
   */
  static async recommendProducts(input: RecommendProductsInput) {
    logger.info(`🤖 Running Product Recommendation for ${input.job_title} in ${input.industry}`);

    let catalog = input.productCatalog;
    if (!catalog || catalog.length === 0) {
      // Pull active platform plans from DB
      const dbPlans = await prisma.plan.findMany({
        where: { isActive: true, isDeleted: false },
      });

      if (dbPlans.length > 0) {
        catalog = dbPlans.map((p) => ({
          productId: p.id,
          name: p.name,
          description: p.description || `${p.name} membership plan with active features`,
          targetRoles: [input.job_title],
          targetLevels: [input.experience_level],
          metadata: {
            priceInCents: p.priceInCents,
            billingInterval: p.billingInterval,
          },
        }));
      } else {
        catalog = [
          {
            productId: "plan_pro_career",
            name: "iFormat Pro Career Package",
            description: "Full ATS resume builder, cover letter generation, and 1-on-1 career consultation.",
            targetRoles: ["All"],
            targetLevels: ["Junior", "Mid", "Senior"],
          },
          {
            productId: "plan_mentorship",
            name: "1-on-1 Executive Mentorship",
            description: "Direct career guidance with experienced industry leaders and mock interviews.",
            targetRoles: ["Senior", "Lead", "Manager"],
            targetLevels: ["Senior", "Lead"],
          },
        ];
      }
    }

    const response = await AIClient.recommendProducts({
      job_title: input.job_title,
      experience_level: input.experience_level,
      career_goals: input.career_goals,
      skills: input.skills,
      industry: input.industry,
      productCatalog: catalog,
    });

    return response;
  }

  /**
   * Queries the Career Advisor Chatbot
   */
  static async careerChat(input: CareerChatInput, userId?: string) {
    logger.info(`🤖 Querying Career Advisor: "${input.query.slice(0, 50)}..."`);

    let userInfo = input.user_info;
    if (!userInfo && userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          companyName: true,
          companyDescription: true,
        },
      });
      if (user) {
        userInfo = user;
      }
    }

    if (!userInfo || Object.keys(userInfo).length === 0) {
      userInfo = {
        name: "User",
        role: "Job Seeker",
      };
    }

    const response = await AIClient.queryCareerAdvisor({
      query: input.query,
      user_info: userInfo,
      contextSources: input.contextSources,
      chat_history: input.chat_history,
    });

    return response;
  }

  /**
   * Candidate: Analyze fit between candidate's CV and a target job posting
   */
  static async analyzeJobFit(input: AnalyzeJobFitInput, userId: string) {
    logger.info(`🤖 Analyzing candidate job fit for job: ${input.jobId} (User: ${userId})`);

    const job = await prisma.jobPosting.findUnique({
      where: { id: input.jobId, isDeleted: false },
    });

    if (!job) {
      throw new NotFoundError("JobPosting", input.jobId);
    }

    // Retrieve candidate CV
    let cv = null;
    if (input.cvId) {
      cv = await prisma.cV.findUnique({
        where: { id: input.cvId, userId },
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });
    }

    if (!cv) {
      cv = await prisma.cV.findFirst({
        where: { userId, isDeleted: false },
        orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
        include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true },
    });

    const userInfo = {
      name: user?.name || "Candidate",
      email: user?.email || "",
      phone: user?.phone || "",
    };

    const cvContent = cv?.versions[0]?.content;

    // If candidate has no usable resume
    if (!cvContent || !isUsableResumeContent(cvContent)) {
      return {
        hasResume: false,
        jobTitle: job.title,
        company: job.company,
      };
    }

    const cvData = buildScreeningCvJson(cvContent, userInfo);

    const jobDescription = [
      `Target Position: ${job.title}`,
      `Company: ${job.company}`,
      `Industry Category: ${job.category}`,
      `Job Details: ${job.description}`,
      job.requirements.length
        ? `Required Qualifications: ${job.requirements.join("; ")}`
        : "",
      job.responsibilities.length
        ? `Core Responsibilities: ${job.responsibilities.join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    // Guard against excessively long employer-written job descriptions
    const MAX_JOB_DESC_LENGTH = 20_000;
    const safeJobDescription = jobDescription.length > MAX_JOB_DESC_LENGTH
      ? jobDescription.slice(0, MAX_JOB_DESC_LENGTH) + "\n...[truncated]"
      : jobDescription;

    const aiRequest = {
      user_info: userInfo,
      cv_json: cvData as Record<string, any>,
      job_description: safeJobDescription,
    };

    try {
      const result = await AIClient.screenCandidate(aiRequest);

      return {
        hasResume: true,
        resumeId: cv?.id,
        resumeTitle: cv?.title,
        score: typeof result.score === "number" ? Math.round(result.score) : result.score,
        recommendation: result.recommendation,
        summary: result.summary,
        strengths: result.strengths || [],
        gaps: result.gaps || [],
        scoreBreakdown: result.scoreBreakdown,
        evidence: result.evidence || [],
        jobTitle: job.title,
        company: job.company,
        model: result.model || "bedrock-screen",
        tokensUsed: result.tokensUsed,
        // Exact payloads exchanged with the AI service, only for debug accounts
        ...(canSeeRawAiData(user?.email) ? { rawAiResponse: result, aiRequest } : {}),
      };
    } catch (err: any) {
      const errorMsg = err?.message || "Unknown error occurred from AI screening service.";
      logger.error(`AI screening microservice error during job fit analysis: ${errorMsg}`);
      throw new InternalServerError(errorMsg);
    }
  }
}
