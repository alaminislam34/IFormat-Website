"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobs.service";
import {
  ApplyJobRequest,
  CreateJobRequest,
  UpdateApplicationStatusRequest,
} from "@/types/api";
import { JOB_QUERY_KEYS } from "../queries/use-jobs";

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobRequest) => jobsService.createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateJobRequest> }) =>
      jobsService.updateJob(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
    },
  });
}

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => jobsService.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
    },
  });
}

export function useApplyJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ApplyJobRequest) => jobsService.applyToJob(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.detail(variables.jobId) });
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.applications.all });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateApplicationStatusRequest) =>
      jobsService.updateApplicationStatus(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOB_QUERY_KEYS.applications.all });
    },
  });
}
