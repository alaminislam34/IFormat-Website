"use client";

import { useQuery } from "@tanstack/react-query";
import { jobsService } from "@/services/jobs.service";
import { JobFilterParams } from "@/types/api";

export const JOB_QUERY_KEYS = {
  all: ["jobs"] as const,
  lists: () => [...JOB_QUERY_KEYS.all, "list"] as const,
  list: (filters: JobFilterParams) => [...JOB_QUERY_KEYS.lists(), filters] as const,
  employerJobs: (params?: { status?: string; page?: number; limit?: number }) =>
    [...JOB_QUERY_KEYS.all, "employer", params] as const,
  details: () => [...JOB_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...JOB_QUERY_KEYS.details(), id] as const,
  applicants: (jobId: string) => [...JOB_QUERY_KEYS.detail(jobId), "applicants"] as const,
  applications: {
    all: ["applications"] as const,
    candidate: (params?: { status?: string; page?: number; limit?: number }) =>
      ["applications", "candidate", params] as const,
  },
};

export function useJobs(params: JobFilterParams = {}) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.list(params),
    queryFn: () => jobsService.getJobs(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useJobDetails(id: string | null | undefined) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.detail(id || ""),
    queryFn: () => (id ? jobsService.getJobById(id) : null),
    enabled: !!id,
  });
}

export function useEmployerJobs(params: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.employerJobs(params),
    queryFn: () => jobsService.getEmployerJobs(params),
  });
}

export function useJobApplicants(jobId: string | null | undefined) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.applicants(jobId || ""),
    queryFn: () => (jobId ? jobsService.getJobApplicants(jobId) : []),
    enabled: !!jobId,
  });
}

export function useCandidateApplications(params: { status?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: JOB_QUERY_KEYS.applications.candidate(params),
    queryFn: () => jobsService.getCandidateApplications(params),
  });
}
