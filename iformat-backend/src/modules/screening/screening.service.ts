import { prisma } from "../../lib/prisma.js";
import { ApplicationStatus } from "@prisma/client";
import { screenCandidateWithAI } from "../../lib/openai.js";
import { NotFoundError } from "../../errors/index.js";
import { logger } from "../../utils/logger.js";

export class ScreeningService {
  static async screenApplication(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
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
      ? JSON.stringify(application.cv.versions[0].content, null, 2)
      : application.coverNote || "Candidate submitted resume via direct portal application.";

    logger.info(`🤖 Triggering AI screening for application: ${applicationId}`);

    const result = await screenCandidateWithAI({
      jobTitle: application.job.title,
      jobDescription: application.job.description,
      jobRequirements: application.job.requirements,
      candidateName: application.candidateName,
      cvContent: cvData,
    });

    const screeningRecord = await prisma.screeningResult.upsert({
      where: { applicationId },
      create: {
        applicationId,
        score: result.score,
        recommendation: result.recommendation,
        summary: result.summary,
        strengths: result.strengths,
        gaps: result.gaps,
        modelUsed: result.modelUsed,
      },
      update: {
        score: result.score,
        recommendation: result.recommendation,
        summary: result.summary,
        strengths: result.strengths,
        gaps: result.gaps,
        modelUsed: result.modelUsed,
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
