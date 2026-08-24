import { apiClient } from "@/lib/api/api-client";
import {
  ApplyJobRequest,
  CreateJobRequest,
  JobApplicantDTO,
  JobDTO,
  JobFilterParams,
  UpdateApplicationStatusRequest,
} from "@/types/api";

export const jobsService = {
  /**
   * Public: Browse published jobs
   */
  async getJobs(params: JobFilterParams = {}): Promise<JobDTO[]> {
    const res = await apiClient.get<JobDTO[]>("/jobs", {
      params: {
        category: params.category,
        search: params.search,
        location: params.location,
        jobType: params.jobType,
        workplaceType: params.workplaceType,
        page: params.page,
        limit: params.limit,
      },
    });
    return res;
  },

  /**
   * Public / Authenticated: Get single job details
   */
  async getJobById(id: string): Promise<JobDTO> {
    return apiClient.get<JobDTO>(`/jobs/${id}`);
  },

  /**
   * Employer: Create a new job posting
   */
  async createJob(payload: CreateJobRequest): Promise<JobDTO> {
    return apiClient.post<JobDTO>("/jobs", payload);
  },

  /**
   * Employer: Update an existing job posting
   */
  async updateJob(id: string, payload: Partial<CreateJobRequest>): Promise<JobDTO> {
    return apiClient.patch<JobDTO>(`/jobs/${id}`, payload);
  },

  /**
   * Employer: Delete or soft-delete a job posting
   */
  async deleteJob(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/jobs/${id}`);
  },

  /**
   * Employer: List company's own job postings
   */
  async getEmployerJobs(params: { status?: string; page?: number; limit?: number } = {}): Promise<JobDTO[]> {
    return apiClient.get<JobDTO[]>("/jobs/employer/mine", { params });
  },

  /**
   * Candidate: Apply to a job posting
   */
  async applyToJob(payload: ApplyJobRequest): Promise<JobApplicantDTO> {
    return apiClient.post<JobApplicantDTO>("/applications", payload);
  },

  /**
   * Candidate: List candidate's submitted applications
   */
  async getCandidateApplications(params: { status?: string; page?: number; limit?: number } = {}): Promise<JobApplicantDTO[]> {
    return apiClient.get<JobApplicantDTO[]>("/applications/mine", { params });
  },

  /**
   * Employer: List applicants for a specific job
   */
  async getJobApplicants(jobId: string, params: { status?: string; page?: number; limit?: number } = {}): Promise<JobApplicantDTO[]> {
    return apiClient.get<JobApplicantDTO[]>(`/applications/job/${jobId}`, { params });
  },

  /**
   * Employer: Update applicant status
   */
  async updateApplicationStatus(payload: UpdateApplicationStatusRequest): Promise<JobApplicantDTO> {
    return apiClient.patch<JobApplicantDTO>(`/applications/${payload.applicationId}/status`, {
      status: payload.status,
      employerFeedback: payload.employerFeedback,
    });
  },
};
