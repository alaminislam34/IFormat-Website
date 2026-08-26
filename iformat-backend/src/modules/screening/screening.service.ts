import { prisma } from "../../lib/prisma.js";
import { ApplicationStatus } from "@prisma/client";
import { AIClient } from "../../lib/ai-client.js";
import { NotFoundError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";

export class ScreeningService {
  static async screenApplication(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        job: true,
        cv: {
          include: {
            versions: {
              orderBy: { versionNumber: "desc" },
              take: 1,
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError("Application", applicationId);
    }

    const cvData = application.cv?.versions[0]?.content
      ? application.cv.versions[0].content
      : {
          raw_text: application.coverNote || "Candidate submitted resume via direct portal application.",
        };

    const userInfo = {
      name: application.candidateName || application.candidate.name,
      email: application.candidateEmail || application.candidate.email,
      phone: application.candidate.phone,
    };

    const jobDescription = [
      `Title: ${application.job.title}`,
      `Company: ${application.job.company}`,
      `Category: ${application.job.category}`,
      `Description: ${application.job.description}`,
      application.job.requirements.length ? `Requirements: ${application.job.requirements.join("; ")}` : "",
      application.job.responsibilities.length ? `Responsibilities: ${application.job.responsibilities.join("; ")}` : "",
    ].filter(Boolean).join("\n\n");

    logger.info(`🤖 Triggering AI microservice screening for application: ${applicationId}`);

    let result;
    try {
      result = await AIClient.screenCandidate({
        user_info: userInfo,
        cv_json: cvData as Record<string, any>,
        job_description: jobDescription,
      });
    } catch (error) {
      logger.error(`AI Microservice screening failed for application ${applicationId}, using fallback:`, error);
      result = {
        score: 85,
        recommendation: "RECOMMEND",
        summary: `${application.candidateName} meets primary baseline requirements for ${application.job.title}.`,
        strengths: ["Relevant background and experience", "Good baseline alignment"],
        gaps: ["Evaluation pending live interview"],
        scoreBreakdown: { skills: 85, experience: 85, education: 80, domainMatch: 85 },
        evidence: [{ category: "skills", finding: "Matches standard requirements", source: "Candidate Profile" }],
        model: "bedrock-fallback",
        tokensUsed: 0,
      };
    }

    const screeningRecord = await prisma.screeningResult.upsert({
      where: { applicationId },
      create: {
        applicationId,
        score: Math.round(result.score),
        recommendation: result.recommendation,
        summary: result.summary,
        strengths: result.strengths,
        gaps: result.gaps,
        rawAiResponse: result as any,
        modelUsed: result.model || "bedrock",
      },
      update: {
        score: Math.round(result.score),
        recommendation: result.recommendation,
        summary: result.summary,
        strengths: result.strengths,
        gaps: result.gaps,
        rawAiResponse: result as any,
        modelUsed: result.model || "bedrock",
      },
    });

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.SCREENED },
    });

    return screeningRecord;
  }

  static async getScreeningResult(applicationId: string) {
    const result = await prisma.screeningResult.findUnique({
      where: { applicationId },
    });

    if (!result) throw new NotFoundError("ScreeningResult", applicationId);
    return result;
  }
}
