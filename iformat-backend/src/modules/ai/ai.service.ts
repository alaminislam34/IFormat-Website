import { AIClient } from "../../lib/ai-client.js";
import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import {
  GenerateCoverLetterInput,
  GenerateEmailInput,
  OptimizeResumeInput,
  BuildCvInput,
  RecommendProductsInput,
  CareerChatInput,
} from "./ai.validation.js";

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
}
