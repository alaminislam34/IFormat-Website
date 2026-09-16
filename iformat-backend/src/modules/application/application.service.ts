import { prisma } from "../../lib/prisma.js";
import { ApplicationStatus, JobStatus, Role } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../../errors/index.js";
import { sendEmail } from "../../lib/mailer.js";
import { getFrontendUrl } from "../../config/env.js";
import { ScreeningService } from "../screening/screening.service.js";
import { PaymentService } from "../payment/payment.service.js";
import { CVService } from "../cv/cv.service.js";
import { isUsableResumeContent } from "../cv/cv-content.js";
import { getPagination, createPaginationMeta } from "../../utils/pagination.js";
import {
  ApplyJobInput,
  UpdateStatusInput,
  QueryApplicationsInput,
} from "./application.validation.js";

// Valid State Machine Transitions for ApplicationStatus
const VALID_APPLICATION_TRANSITIONS: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  [ApplicationStatus.SUBMITTED]: [
    ApplicationStatus.SCREENED,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.SCREENED]: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.INTERVIEWING]: [
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.OFFERED]: [
    ApplicationStatus.HIRED,
    ApplicationStatus.REJECTED,
  ],
  [ApplicationStatus.HIRED]: [], // Terminal state
  [ApplicationStatus.REJECTED]: [], // Terminal state
};

export class ApplicationService {
  /**
   * Candidate applies to a published job posting
   */
  static async apply(candidateId: string, input: ApplyJobInput) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: input.jobId },
    });

    if (!job || job.isDeleted) {
      throw new NotFoundError("Job", input.jobId);
    }

    // 1. Verify job is actively accepting applications
    if (job.status !== JobStatus.PUBLISHED) {
      throw new ValidationError(
        "This job posting is closed or no longer accepting applications"
      );
    }

    // 2. Verify application deadline hasn't passed
    if (job.validity && new Date() > new Date(job.validity)) {
      throw new ValidationError(
        "The application deadline for this job posting has expired"
      );
    }

    // 3. Prevent employer from applying to their own job
    if (job.employerId === candidateId) {
      throw new ForbiddenError("You cannot apply to a job posting that you created");
    }

    // 4. Prevent duplicate applications at DB level + friendly error
    const existing = await prisma.application.findUnique({
      where: {
        jobId_candidateId: {
          jobId: input.jobId,
          candidateId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("You have already applied for this position", [
        { field: "jobId", message: "You have already applied for this position" },
      ]);
    }

    if (!input.cvId) {
      throw new ValidationError(
        "A readable resume is required to apply. Upload a PDF or attach a saved CV."
      );
    }

    await this.assertCandidateResume(candidateId, input.cvId);

    // 5. Create application and employer in-app notification inside a transaction
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId: input.jobId,
          candidateId,
          cvId: input.cvId || null,
          candidateName: input.candidateName,
          candidateEmail: input.candidateEmail.toLowerCase().trim(),
          coverNote: input.coverNote || null,
          status: ApplicationStatus.SUBMITTED,
        },
        include: {
          job: {
            select: {
              title: true,
              company: true,
              location: true,
            },
          },
        },
      });

      // In-app notification for employer
      await tx.notification.create({
        data: {
          userId: job.employerId,
          type: "NEW_APPLICANT",
          title: `New Applicant: ${input.candidateName}`,
          message: `${input.candidateName} applied for "${job.title}".`,
          payload: {
            applicationId: app.id,
            jobId: job.id,
          },
        },
      });

      return app;
    });

    // 6. Asynchronously trigger AI Candidate Screening
    ScreeningService.screenApplication(application.id).catch((err) => {
      console.error(`AI Screening background error for application ${application.id}:`, err);
    });

    return application;
  }

  /**
   * Candidate views their own applications list (Query level data isolation)
   */
  static async listCandidateApplications(
    candidateId: string,
    query: QueryApplicationsInput
  ) {
    const { page, limit, skip } = getPagination(query);

    const where: any = {
      candidateId,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true,
              category: true,
              jobType: true,
              location: true,
              salary: true,
              status: true,
              employer: {
                select: {
                  companyLogoUrl: true,
                  companyName: true,
                },
              },
            },
          },
          screeningResult: {
            select: {
              score: true,
              recommendation: true,
              summary: true,
              modelUsed: true,
            },
          },
        },
      }),
      prisma.application.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { applications, meta };
  }

  /**
   * Employer views applications for a specific job posting they own
   */
  static async listJobApplications(
    jobId: string,
    employerId: string,
    query: QueryApplicationsInput,
    userRole?: Role
  ) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!job || job.isDeleted) {
      throw new NotFoundError("Job", jobId);
    }

    const isOwner = job.employerId === employerId;
    const isAdmin = userRole === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("You do not have permission to view applicants for this job");
    }

    const { page, limit, skip } = getPagination(query);

    const where: any = {
      jobId,
    };

    if (query.status) {
      where.status = query.status;
    }

    // Check if employer has unmasked profile access
    let unmasked = true;
    if (!isAdmin) {
      const subDetails = await PaymentService.getUserSubscriptionDetails(employerId);
      unmasked = subDetails.effectiveLimits.unmaskedApplicantProfiles;
    }

    const [rawApplications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          candidate: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              phone: true,
            },
          },
          cv: {
            include: {
              versions: {
                orderBy: { versionNumber: "desc" },
                take: 1,
              },
            },
          },
          screeningResult: true,
        },
      }),
      prisma.application.count({ where }),
    ]);

    const applications = unmasked
      ? rawApplications
      : rawApplications.map((app) => ({
          ...app,
          candidateEmail: app.candidateEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
          candidate: {
            ...app.candidate,
            email: app.candidate.email.replace(/(.{2})(.*)(@.*)/, "$1***$3"),
            phone: app.candidate.phone ? "***-***-****" : null,
          },
        }));

    const meta = createPaginationMeta(total, page, limit);
    return { applications, meta };
  }

  /**
   * Employer updates candidate application status (with State Machine Validation)
   */
  static async updateStatus(
    applicationId: string,
    employerId: string,
    input: UpdateStatusInput,
    userRole?: Role
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
      },
    });

    if (!application) {
      throw new NotFoundError("Application", applicationId);
    }

    const isOwner = application.job.employerId === employerId;
    const isAdmin = userRole === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("You do not have permission to update this application");
    }

    // State machine check
    if (input.status !== application.status) {
      const allowedTransitions = VALID_APPLICATION_TRANSITIONS[application.status];
      if (!allowedTransitions.includes(input.status)) {
        throw new ValidationError(
          `Cannot transition application status from '${application.status}' to '${input.status}'. Allowed transitions: [${allowedTransitions.join(", ")}]`
        );
      }
    }

    // Update status and create candidate notification atomically
    const updated = await prisma.$transaction(async (tx) => {
      const appRecord = await tx.application.update({
        where: { id: applicationId },
        data: {
          status: input.status,
          employerFeedback: input.employerFeedback !== undefined ? input.employerFeedback : undefined,
        },
      });

      // In-app notification for candidate
      await tx.notification.create({
        data: {
          userId: application.candidateId,
          type: "APPLICATION_STATUS_UPDATE",
          title: `Application ${input.status}: ${application.job.title}`,
          message: `Your application for "${application.job.title}" at "${application.job.company}" has been updated to ${input.status}.`,
          payload: {
            applicationId: application.id,
            jobId: application.jobId,
            status: input.status,
          },
        },
      });

      return appRecord;
    });

    // Notify Candidate asynchronously via email
    sendEmail({
      to: application.candidateEmail,
      subject: `Application Update: ${application.job.title} at ${application.job.company}`,
      template: "application-status",
      data: {
        candidateName: application.candidateName,
        jobTitle: application.job.title,
        companyName: application.job.company,
        newStatus: input.status,
        feedback: input.employerFeedback || "",
        portalUrl: `${getFrontendUrl()}/dashboard/applications`,
      },
    }).catch((err) => {
      console.error("Failed to send application status update email:", err);
    });

    return updated;
  }

  /**
   * Candidate replaces the resume on an existing application, then screening re-runs
   * against the new document instead of leftover metadata / demo templates.
   */
  static async replaceResume(
    applicationId: string,
    candidateId: string,
    options: { cvId?: string; file?: Express.Multer.File; req?: import("express").Request }
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundError("Application", applicationId);
    }

    if (application.candidateId !== candidateId) {
      throw new ForbiddenError("You can only update the resume on your own application");
    }

    if (
      application.status === ApplicationStatus.HIRED ||
      application.status === ApplicationStatus.REJECTED
    ) {
      throw new ValidationError("This application is closed and can no longer accept a new resume");
    }

    let cvId = options.cvId;
    if (options.file) {
      const uploaded = await CVService.createFromUploadedPdf(candidateId, options.file, {
        title: `Updated application resume`,
        req: options.req,
      });
      cvId = uploaded.id;
    }

    if (!cvId) {
      throw new ValidationError("Upload a PDF resume or choose a saved CV");
    }

    await this.assertCandidateResume(candidateId, cvId);

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { cvId },
      include: {
        job: {
          select: {
            title: true,
            company: true,
            location: true,
          },
        },
        screeningResult: true,
      },
    });

    const screeningResult = await ScreeningService.screenApplication(applicationId);
    return { ...updated, screeningResult };
  }

  private static async assertCandidateResume(candidateId: string, cvId: string) {
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!cv || cv.isDeleted) {
      throw new NotFoundError("CV", cvId);
    }

    if (cv.userId !== candidateId) {
      throw new ForbiddenError("You can only apply with a resume you own");
    }

    const content = cv.versions[0]?.content;
    if (!isUsableResumeContent(content)) {
      throw new ValidationError(
        "This resume cannot be scored. Upload a text-based PDF of your own profile, or complete your resume in the profile editor. Demo templates are not accepted."
      );
    }
  }
}
