import { env } from "../config/env.js";

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "iFormat API Documentation",
    version: "1.0.0",
    description:
      "Comprehensive, production-grade REST API documentation for the iFormat Career & Talent Acquisition Platform.",
    contact: {
      name: "iFormat Engineering Team",
      email: "contact@iformat.com",
    },
  },
  servers: [
    {
      url: `/api/${env.API_VERSION}`,
      description: "Current API Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your Bearer access token to authorize requests.",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Error message details" },
          code: { type: "string", example: "VALIDATION_ERROR" },
        },
      },
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "Operation completed successfully" },
          data: { type: "object" },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { type: "string", enum: ["candidate", "employer", "admin"] },
          emailVerified: { type: "boolean" },
          avatar: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", minLength: 8, example: "SecretPassword123!" },
          name: { type: "string", example: "Alex Morgan" },
          role: { type: "string", enum: ["candidate", "employer"], default: "candidate" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "alex@example.com" },
          password: { type: "string", example: "SecretPassword123!" },
        },
      },
      VerifyOtpRequest: {
        type: "object",
        required: ["email", "otp", "type"],
        properties: {
          email: { type: "string", format: "email", example: "alex@example.com" },
          otp: { type: "string", example: "123456" },
          type: { type: "string", enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"], example: "EMAIL_VERIFICATION" },
        },
      },
      CoverLetterRequest: {
        type: "object",
        required: ["role", "company", "experienceContext"],
        properties: {
          candidateName: { type: "string", example: "Alex Morgan" },
          role: { type: "string", example: "Senior Full Stack Developer" },
          company: { type: "string", example: "Vercel Inc" },
          recipient: { type: "string", example: "Hiring Manager" },
          experienceContext: { type: "string", example: "5+ years building Next.js web applications, TypeScript, and microservices." },
          tone: { type: "string", enum: ["professional", "persuasive", "executive", "enthusiastic"], default: "professional" },
        },
      },
      EmailGenerationRequest: {
        type: "object",
        required: ["role", "company", "context"],
        properties: {
          recipientName: { type: "string", example: "Sarah Johnson" },
          role: { type: "string", example: "Engineering Lead" },
          company: { type: "string", example: "Stripe" },
          context: { type: "string", example: "Experienced in building scalable payment APIs with Next.js and Postgres." },
          tone: { type: "string", enum: ["formal", "casual", "enthusiastic"], default: "formal" },
        },
      },
      ResumeOptimizationRequest: {
        type: "object",
        required: ["rawText"],
        properties: {
          rawText: { type: "string", example: "Built backend APIs and improved performance of Postgres databases." },
          targetRole: { type: "string", example: "Senior Backend Engineer" },
          industry: { type: "string", example: "FinTech" },
        },
      },
    },
  },
  tags: [
    { name: "System", description: "Health check & core probes" },
    { name: "Auth", description: "User registration, authentication, OTP verification & sessions" },
    { name: "AI", description: "OpenAI-driven Career Assistant tools (Cover Letters, Emails, Resume ATS Optimization)" },
    { name: "Screening", description: "AI Candidate evaluation, match scoring, and recruiter insights" },
    { name: "Jobs", description: "Job postings, categories, filtering & employer management" },
    { name: "Applications", description: "Job application submissions, status tracking & CV attachments" },
    { name: "CV & Resume", description: "CV management, multi-version content storage & generation" },
    { name: "Bookings", description: "Expert consultation availability slots and bookings" },
    { name: "Plans & Payments", description: "Subscription tiers, Stripe Checkout sessions & billing" },
    { name: "Users", description: "User profile management and account customization" },
    { name: "Admin", description: "Administrative controls, audit logs, and user management" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "API Health Check Probe",
        description: "Checks if the API server and database connection are active and healthy.",
        responses: {
          200: {
            description: "API is healthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully, OTP dispatched to email." },
          400: { description: "Invalid input or user already exists." },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Authenticate user and issue JWT tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          200: { description: "Authentication successful." },
          401: { description: "Invalid credentials or unverified email." },
        },
      },
    },
    "/auth/verify-otp": {
      post: {
        tags: ["Auth"],
        summary: "Verify 6-digit OTP code",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
            },
          },
        },
        responses: {
          200: { description: "OTP verified successfully." },
          400: { description: "Invalid or expired OTP." },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user profile",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "User session details retrieved." },
          401: { description: "Unauthorized request." },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Sign out user and clear auth cookies",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Successfully logged out." },
        },
      },
    },
    "/ai/cover-letter": {
      post: {
        tags: ["AI"],
        summary: "Generate tailored cover letter with AI",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CoverLetterRequest" },
            },
          },
        },
        responses: {
          200: {
            description: "Generated cover letter returned.",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean", example: true },
                    data: {
                      type: "object",
                      properties: {
                        letter: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/ai/email": {
      post: {
        tags: ["AI"],
        summary: "Generate high-converting cold outreach email",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EmailGenerationRequest" },
            },
          },
        },
        responses: {
          200: { description: "Generated outreach email returned." },
        },
      },
    },
    "/ai/resume/optimize": {
      post: {
        tags: ["AI"],
        summary: "Optimize resume bullet points and ATS keywords",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ResumeOptimizationRequest" },
            },
          },
        },
        responses: {
          200: { description: "Optimized resume bullet points returned." },
        },
      },
    },
    "/screening/{applicationId}": {
      post: {
        tags: ["Screening"],
        summary: "Trigger automated AI candidate screening",
        parameters: [
          {
            name: "applicationId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Screening report generated." },
        },
      },
      get: {
        tags: ["Screening"],
        summary: "Retrieve screening results for an application",
        parameters: [
          {
            name: "applicationId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Screening results retrieved." },
        },
      },
    },
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "List and filter active job postings",
        parameters: [
          { name: "category", in: "query", schema: { type: "string" } },
          { name: "location", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "List of job postings." },
        },
      },
      post: {
        tags: ["Jobs"],
        summary: "Post a new job (Employer only)",
        security: [{ bearerAuth: [] }],
        responses: {
          201: { description: "Job posting created." },
        },
      },
    },
    "/jobs/{id}": {
      get: {
        tags: ["Jobs"],
        summary: "Get single job details",
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Job details." },
        },
      },
    },
    "/plans": {
      get: {
        tags: ["Plans & Payments"],
        summary: "List all active membership and subscription plans",
        responses: {
          200: { description: "List of plans." },
        },
      },
    },
    "/payments/checkout": {
      post: {
        tags: ["Plans & Payments"],
        summary: "Initiate Stripe Checkout session for a subscription plan",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Stripe checkout session URL created." },
        },
      },
    },
    "/bookings/slots": {
      get: {
        tags: ["Bookings"],
        summary: "List upcoming available consultation slots",
        responses: {
          200: { description: "List of available consultation slots." },
        },
      },
    },
  },
};
