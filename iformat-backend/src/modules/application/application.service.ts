import { prisma } from "../../lib/prisma.js";
import { ApplicationStatus, JobStatus, Role } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  ValidationError,
} from "../../errors/index.js";
import { sendEmail } from "../../lib/mailer.js";
import { env } from "../../config/env.js";
import { ScreeningService } from "../screening/screening.service.js";
import { PaymentService } from "../payment/payment.service.js";
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

    // 5. Create application
    const application = await prisma.application.create({
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

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: input.status,
        employerFeedback: input.employerFeedback !== undefined ? input.employerFeedback : undefined,
      },
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
        portalUrl: `${env.CORS_ORIGIN}/job-portal`,
      },
    }).catch((err) => {
      console.error("Failed to send application status update email:", err);
    });

    return updated;
  }
}
