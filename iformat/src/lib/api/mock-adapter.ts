import {
  AuthResponse,
  CreateJobRequest,
  GenerateCoverLetterRequest,
  GenerateEmailRequest,
  JobDTO,
  JobFilterParams,
  LoginRequest,
  RegisterRequest,
  UserSession,
} from "@/types/api";
import { MOCK_JOBS, MOCK_USER } from "./mock-data";

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

class MockDatabase {
  private jobs: JobDTO[] = [...MOCK_JOBS];
  private currentUser: UserSession | null = null;

  async login(request: LoginRequest): Promise<AuthResponse> {
    await delay(600);
    const user: UserSession = {
      ...MOCK_USER,
      email: request.email,
      name: request.email.split("@")[0] || "User",
    };
    this.currentUser = user;
    return {
      user,
      accessToken: "mock_jwt_access_token_" + Date.now(),
      refreshToken: "mock_jwt_refresh_token_" + Date.now(),
    };
  }

  async register(request: RegisterRequest): Promise<AuthResponse> {
    await delay(700);
    const user: UserSession = {
      id: "usr_" + Date.now(),
      name: request.name,
      email: request.email,
      role: request.role || "candidate",
      avatar: request.name[0]?.toUpperCase() || "U",
      createdAt: new Date().toISOString(),
    };
    this.currentUser = user;
    return {
      user,
      accessToken: "mock_jwt_access_token_" + Date.now(),
      refreshToken: "mock_jwt_refresh_token_" + Date.now(),
    };
  }

  async getCurrentUser(): Promise<UserSession | null> {
    await delay(200);
    return this.currentUser || MOCK_USER;
  }

  async getJobs(params: JobFilterParams = {}): Promise<JobDTO[]> {
    await delay(350);
    let result = [...this.jobs];

    if (params.category && params.category !== "All Industries" && params.category !== "All") {
      result = result.filter(
        (job) => job.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase().trim();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.company.toLowerCase().includes(q) ||
          job.description.toLowerCase().includes(q)
      );
    }

    if (params.location && params.location !== "All") {
      result = result.filter(
        (job) => job.location.toLowerCase() === params.location?.toLowerCase()
      );
    }

    return result;
  }

  async getJobById(id: string): Promise<JobDTO | null> {
    await delay(250);
    return this.jobs.find((j) => j.id === id) || null;
  }

  async createJob(request: CreateJobRequest): Promise<JobDTO> {
    await delay(600);
    const colors = [
      "bg-black",
      "bg-indigo-600",
      "bg-orange-500",
      "bg-blue-600",
      "bg-purple-600",
      "bg-emerald-600",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const company = request.company || "iFormat Partner";
    const newJob: JobDTO = {
      id: String(Date.now()),
      title: request.title,
      company,
      logoBg: randomColor,
      logoLetter: company.charAt(0).toUpperCase() || "C",
      date: "Just now",
      jobType: request.jobType || "Full Time",
      location: request.location || "Remote",
      salary: request.salary || "Competitive",
      category: request.category || "Technology & Engineering",
      description: request.description,
      responsibilities: request.responsibilities || [],
      requirements: request.requirements || [],
      niceToHave: request.niceToHave || [],
      perks: request.perks || [],
      applicants: [],
      createdAt: new Date().toISOString(),
    };

    this.jobs.unshift(newJob);
    return newJob;
  }

  async applyToJob(jobId: string, candidateName: string, candidateEmail: string): Promise<boolean> {
    await delay(500);
    const job = this.jobs.find((j) => j.id === jobId);
    if (job) {
      if (!job.applicants) job.applicants = [];
      job.applicants.push({
        id: "app_" + Date.now(),
        name: candidateName,
        email: candidateEmail,
        date: "Today",
        avatar: candidateName.charAt(0).toUpperCase() || "A",
        color: "bg-sky-500",
      });
      return true;
    }
    return false;
  }

  async generateCoverLetter(request: GenerateCoverLetterRequest): Promise<string> {
    await delay(900);
    const date = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    return `${date}\n\nDear ${request.recipient || "Hiring Manager"},\n\nI am writing to express my strong enthusiasm for the ${
      request.role
    } role at ${
      request.company
    }. With extensive experience in modern web architecture, performant user interfaces, and scalable systems, I am confident in my ability to deliver immediate value to your team.\n\n${
      request.experienceContext ||
      "Throughout my career, I have specialized in building highly performant applications that drive significant business growth and user engagement."
    }\n\nI admire ${
      request.company
    }'s dedication to innovation and quality, and I look forward to the possibility of discussing how my background and skills align with your engineering and product goals.\n\nThank you for your time and consideration.\n\nWarm regards,\n${
      request.candidateName || "Alex Morgan"
    }`;
  }

  async generateOutreachEmail(request: GenerateEmailRequest): Promise<string> {
    await delay(700);
    const toneMap = {
      Professional: `Subject: Application & Introduction: ${request.role} - [Your Name]\n\nDear ${
        request.recipient || "Hiring Team"
      },\n\nI recently came across the ${request.role} opening at ${
        request.company
      } and wanted to reach out directly. ${
        request.context || "I bring deep full-stack and frontend experience."
      }\n\nI would appreciate the opportunity to connect for 10 minutes this week to discuss how I can contribute to ${
        request.company
      }'s upcoming initiatives.\n\nBest regards,`,
      Friendly: `Subject: Excited about ${request.role} at ${request.company}!\n\nHi ${
        request.recipient || "Team"
      },\n\nHope your week is off to a great start! I saw your opening for ${
        request.role
      } at ${
        request.company
      } and got really excited about the work your team is doing.\n\n${
        request.context || "I love building clean, responsive user experiences."
      }\n\nWould love to chat over a quick virtual coffee if you have time!\n\nCheers,`,
      Confident: `Subject: Senior Impact for ${request.role} at ${request.company}\n\nHi ${
        request.recipient || "Hiring Leader"
      },\n\nIf ${
        request.company
      } is looking for a proven ${request.role} who can ship high-velocity, reliable software from day one, I'd love to connect.\n\n${
        request.context || "I have a track record of scaling high-traffic web products."
      }\n\nLet's schedule a brief 10-minute discovery call.\n\nBest,`,
      Concise: `Subject: ${request.role} candidate - ${request.company}\n\nHi ${
        request.recipient || "Hiring Team"
      },\n\nQuick note to express my interest in the ${request.role} position at ${
        request.company
      }.\n\nHighlights:\n• ${
        request.context || "Full-stack Next.js/React engineering expertise"
      }\n• Proven track record in high-performance frontends\n\nAre you open to a brief introductory call?\n\nThanks,`,
    };

    return toneMap[request.tone] || toneMap.Professional;
  }
}

export const mockDb = new MockDatabase();
