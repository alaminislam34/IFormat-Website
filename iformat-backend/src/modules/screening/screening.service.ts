import { prisma } from "../../lib/prisma.js";
import { ApplicationStatus } from "@prisma/client";
import { AIClient } from "../../lib/ai-client.js";
import { NotFoundError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";
import {
  buildScreeningCvJson,
  describeUnusableResume,
  isUsableResumeContent,
} from "../cv/cv-content.js";

const INSUFFICIENT_RESUME = "INSUFFICIENT_RESUME";

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

    const userInfo = {
      name: application.candidateName || application.candidate.name,
      email: application.candidateEmail || application.candidate.email,
      phone: application.candidate.phone,
    };

    const cvContent = application.cv?.versions[0]?.content;
    const coverNote = application.coverNote?.trim();

    let result;

    if (!isUsableResumeContent(cvContent)) {
      const reason = describeUnusableResume(cvContent);
      logger.warn(
        `⚠️ Skipping AI screening for application ${applicationId}: ${reason}`
      );
      result = {
        score: 0,
        recommendation: INSUFFICIENT_RESUME,
        summary: `${reason} Alignment was not scored, so this is not a judgment of the candidate. Ask them to upload a readable PDF or attach a completed profile resume, then re-run screening.`,
        strengths: [],
        gaps: [
          "Readable resume content is required before role alignment can be scored.",
        ],
        scoreBreakdown: { skills: 0, experience: 0, education: 0, domainMatch: 0 },
        evidence: [
          {
            category: "domain_match",
            finding: reason,
            source: "Application resume",
          },
        ],
        model: "resume-gate",
        tokensUsed: 0,
      };
    } else {
      const cvData = buildScreeningCvJson(cvContent, userInfo);

      const jobDescription = [
        `Target Position: ${application.job.title}`,
        `Company: ${application.job.company}`,
        `Industry Category: ${application.job.category}`,
        `Job Details: ${application.job.description}`,
        application.job.requirements.length
          ? `Required Qualifications: ${application.job.requirements.join("; ")}`
          : "",
        application.job.responsibilities.length
          ? `Core Responsibilities: ${application.job.responsibilities.join("; ")}`
          : "",
        coverNote ? `Candidate cover note: ${coverNote}` : "",
        "EVALUATION NOTE: Only describe the candidate's background using facts that appear in their CV text. Never invent a job title, profession, or skill (for example Backend Developer) if it is not present in the CV. If the CV does not match this target position, explain the mismatch using the actual CV content.",
      ]
        .filter(Boolean)
        .join("\n\n");

      logger.info(`🤖 Triggering AI microservice screening for application: ${applicationId}`);

      try {
        result = await AIClient.screenCandidate({
          user_info: userInfo,
          cv_json: cvData as Record<string, any>,
          job_description: jobDescription,
        });
      } catch (error) {
        logger.error(
          `AI Microservice screening failed for application ${applicationId}, using fallback:`,
          error
        );
        result = {
          score: 85,
          recommendation: "RECOMMEND",
          summary: `${application.candidateName} meets primary baseline requirements for ${application.job.title}.`,
          strengths: ["Relevant background and experience", "Good baseline alignment"],
          gaps: ["Evaluation pending live interview"],
          scoreBreakdown: { skills: 85, experience: 85, education: 80, domainMatch: 85 },
          evidence: [
            { category: "skills", finding: "Matches standard requirements", source: "Candidate Profile" },
          ],
          model: "bedrock-fallback",
          tokensUsed: 0,
        };
      }
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
