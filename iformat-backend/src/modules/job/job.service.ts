import { prisma } from "../../lib/prisma.js";
import { JobStatus, Role } from "@prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../../errors/index.js";
import { getPagination, createPaginationMeta } from "../../utils/pagination.js";
import { CreateJobInput, UpdateJobInput, QueryJobsInput } from "./job.validation.js";

// Valid State Machine Transitions for JobStatus
const VALID_JOB_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.DRAFT]: [JobStatus.PUBLISHED, JobStatus.ARCHIVED],
  [JobStatus.PUBLISHED]: [JobStatus.CLOSED, JobStatus.DRAFT, JobStatus.ARCHIVED],
  [JobStatus.CLOSED]: [JobStatus.PUBLISHED, JobStatus.ARCHIVED],
  [JobStatus.ARCHIVED]: [], // Terminal state
};

export class JobService {
  /**
   * Public: List all published active jobs with multi-facet filters & pagination
   */
  static async listJobs(query: QueryJobsInput) {
    const { page, limit, skip } = getPagination(query);

    const where: any = {
      status: JobStatus.PUBLISHED,
      isDeleted: false,
    };

    if (
      query.category &&
      query.category !== "All" &&
      query.category !== "All Industries"
    ) {
      where.category = { contains: query.category, mode: "insensitive" };
    }

    if (
      query.jobType &&
      query.jobType !== "All" &&
      !query.jobType.startsWith("All")
    ) {
      where.jobType = { contains: query.jobType, mode: "insensitive" };
    }

    if (
      query.workplaceType &&
      query.workplaceType !== "All" &&
      !query.workplaceType.startsWith("All")
    ) {
      where.workplaceType = { contains: query.workplaceType, mode: "insensitive" };
    }

    if (
      query.location &&
      query.location !== "All" &&
      !query.location.startsWith("All")
    ) {
      where.location = { contains: query.location, mode: "insensitive" };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              companyName: true,
              companyLogoUrl: true,
              companyVideoUrl: true,
              companyWebsite: true,
              companyDescription: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { jobs, meta };
  }

  /**
   * Public or Authenticated: Fetch job posting details by ID
   */
  static async getJobById(jobId: string, currentUser?: { id: string; role: Role }) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            companyName: true,
            companyWebsite: true,
            companyDescription: true,
            companyLogoUrl: true,
            companyVideoUrl: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job || job.isDeleted) {
      throw new NotFoundError("Job", jobId);
    }

    // If job is not published, only the owner or Admin can view it
    if (job.status !== JobStatus.PUBLISHED) {
      const isOwner = currentUser && currentUser.id === job.employerId;
      const isAdmin = currentUser && currentUser.role === Role.ADMIN;
      if (!isOwner && !isAdmin) {
        throw new NotFoundError("Job", jobId);
      }
    }

    return job;
  }

  /**
   * Employer/Admin: Create a new job posting
   */
  static async createJob(employerId: string, input: CreateJobInput) {
    const employer = await prisma.user.findUnique({
      where: { id: employerId },
      select: { companyName: true },
    });

    const companyName = input.company || employer?.companyName || "iFormat Partner";

    const job = await prisma.jobPosting.create({
      data: {
        ...input,
        company: companyName,
        employerId,
        validity: input.validity ? new Date(input.validity) : null,
      },
    });

    return job;
  }

  /**
   * Employer/Admin: Update existing job posting with ownership & state machine checks
   */
  static async updateJob(
    jobId: string,
    employerId: string,
    input: UpdateJobInput,
    userRole?: Role
  ) {
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job || job.isDeleted) {
      throw new NotFoundError("Job", jobId);
    }

    const isOwner = job.employerId === employerId;
    const isAdmin = userRole === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("You do not have permission to update this job posting");
    }

    // State machine validation if status is changing
    if (input.status && input.status !== job.status) {
      const allowedNextStatuses = VALID_JOB_TRANSITIONS[job.status];
      if (!allowedNextStatuses.includes(input.status)) {
        throw new ValidationError(
          `Cannot transition job status from '${job.status}' to '${input.status}'. Allowed transitions: [${allowedNextStatuses.join(", ")}]`
        );
      }
    }

    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        ...input,
        validity: input.validity !== undefined ? (input.validity ? new Date(input.validity) : null) : undefined,
      },
    });

    return updated;
  }

  /**
   * Employer/Admin: Delete or soft-delete job posting based on application history
   */
  static async deleteJob(jobId: string, employerId: string, userRole?: Role) {
    const job = await prisma.jobPosting.findUnique({
      where: { id: jobId },
      include: {
        _count: { select: { applications: true } },
      },
    });

    if (!job || job.isDeleted) {
      throw new NotFoundError("Job", jobId);
    }

    const isOwner = job.employerId === employerId;
    const isAdmin = userRole === Role.ADMIN;
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("You do not have permission to delete this job posting");
    }

    // If job has active candidate applications, perform soft-delete to preserve candidate records
    if (job._count.applications > 0) {
      await prisma.jobPosting.update({
        where: { id: jobId },
        data: {
          isDeleted: true,
          status: JobStatus.ARCHIVED,
        },
      });
      return { message: "Job has active applications and was safely archived." };
    }

    // If 0 applications, hard-delete
    await prisma.jobPosting.delete({ where: { id: jobId } });
    return { message: "Job posting permanently deleted." };
  }

  /**
   * Employer/Admin: List all jobs owned by current company
   */
  static async listEmployerJobs(employerId: string, query: { status?: JobStatus; page?: number; limit?: number }) {
    const { page, limit, skip } = getPagination(query);

    const where: any = {
      employerId,
      isDeleted: false,
    };

    if (query.status) {
      where.status = query.status;
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { jobs, meta };
  }
}
