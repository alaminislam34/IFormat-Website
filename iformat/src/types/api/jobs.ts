export type JobType = "Full Time" | "Part Time" | "Contract" | "Internship" | string;
export type WorkplaceType = "Remote" | "Onsite" | "Hybrid" | string;
export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type ApplicationStatus =
  | "SUBMITTED"
  | "SCREENED"
  | "SHORTLISTED"
  | "INTERVIEWING"
  | "OFFERED"
  | "HIRED"
  | "REJECTED";

export interface JobApplicantDTO {
  id?: string;
  jobId?: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  name?: string;
  email?: string;
  date?: string;
  avatar?: string;
  color?: string;
  resumeUrl?: string;
  coverNote?: string | null;
  status?: ApplicationStatus;
  employerFeedback?: string | null;
  createdAt?: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
  screeningResult?: {
    id: string;
    score: number;
    recommendation: string;
    summary: string;
    strengths?: string[];
    gaps?: string[];
  } | null;
}

export interface JobDTO {
  id: string;
  title: string;
  company: string;
  category: string;
  jobType: string;
  workplaceType?: string;
  location: string;
  salary: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  validity?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  perks: string[];
  status?: JobStatus;
  createdAt?: string;
  updatedAt?: string;
  date?: string;
  logoBg?: string;
  logoLetter?: string;
  applicants?: JobApplicantDTO[];
  employer?: {
    id: string;
    name: string;
    companyName?: string | null;
    companyLogoUrl?: string | null;
    companyWebsite?: string | null;
  };
  _count?: {
    applications: number;
  };
}

export interface JobFilterParams {
  category?: string;
  search?: string;
  location?: string;
  jobType?: string;
  workplaceType?: string;
  status?: JobStatus;
  page?: number;
  limit?: number;
}

export interface CreateJobRequest {
  title: string;
  company?: string;
  category?: string;
  jobType?: string;
  workplaceType?: string;
  location?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  validity?: string | null;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
  perks?: string[];
  status?: JobStatus;
}

export interface ApplyJobRequest {
  jobId: string;
  cvId?: string | null;
  candidateName: string;
  candidateEmail: string;
  coverNote?: string | null;
  resumeUrl?: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusRequest {
  applicationId: string;
  status: ApplicationStatus;
  employerFeedback?: string | null;
}
