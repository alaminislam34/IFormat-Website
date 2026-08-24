# iFormat Backend Service

Production-grade, modular monolith REST API built with Node.js, Express.js, TypeScript, PostgreSQL, and Prisma.

---

## 🏗️ Architecture

```
src/
├── app.ts                     # Express app configuration & middlewares
├── server.ts                  # Startup lifecycle & graceful shutdown
├── config/                    # Zod environment & application constants
├── errors/                    # Standardized AppError hierarchy
├── lib/                       # Isolated external clients (Prisma, OpenAI, Stripe, S3, SMTP, Passport)
├── middlewares/               # Zod validation, Auth, RBAC, Rate limiting, Global Error handler
├── modules/                   # Feature-oriented domain modules
│   ├── auth/                  # Authentication & Password Reset
│   ├── oauth/                 # Google OAuth 2.0 & Account Linking
│   ├── user/                  # Candidate & Employer Profiles
│   ├── cv/                    # CV Builder, JSON content & versioning
│   ├── job/                   # Job Postings, Search & Filter
│   ├── application/           # Job Applications & Status Workflow
│   ├── screening/             # AI Candidate Screening (OpenAI)
│   ├── booking/               # Consultation Booking (Concurrency-safe)
│   ├── payment/               # Stripe Checkout & Webhook Processing
│   ├── notification/          # In-app alerts & Email dispatch
│   └── admin/                 # Platform metrics & Administration
├── routes/                    # Central router mounting all /api/v1/* routes
├── types/                     # TypeScript type augmentations
├── utils/                     # Response helpers, pagination, tokens, password hashing, logger
└── views/emails/              # Server-side EJS transactional email templates
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### 3. Generate Prisma Client & Migrate Database
```bash
pnpm prisma:generate
pnpm prisma:migrate
```

### 4. Run Development Server
```bash
pnpm dev
```
The server will start on `http://localhost:5000` with the API mounted at `http://localhost:5000/api/v1`.

---

## 📡 API Endpoints Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/v1/health` | Healthcheck & system uptime |
| **Auth** | `POST` | `/api/v1/auth/register` | Register candidate or employer |
| **Auth** | `POST` | `/api/v1/auth/login` | Email/password login |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate access/refresh tokens |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revoke session & clear cookies |
| **Auth** | `POST` | `/api/v1/auth/forgot-password` | Send password reset email |
| **Auth** | `POST` | `/api/v1/auth/reset-password` | Set new password via token |
| **OAuth** | `GET` | `/api/v1/oauth/google` | Initiate Google OAuth 2.0 login |
| **OAuth** | `GET` | `/api/v1/oauth/google/callback` | Google OAuth callback handler |
| **Users** | `GET` | `/api/v1/users/me` | Fetch authenticated profile |
| **Users** | `PATCH`| `/api/v1/users/me` | Update personal details |
| **Users** | `POST` | `/api/v1/users/company` | Save employer company profile |
| **CVs** | `GET` | `/api/v1/cv` | List user CVs |
| **CVs** | `POST` | `/api/v1/cv` | Create new CV with initial version |
| **CVs** | `POST` | `/api/v1/cv/:id/versions` | Append new CV version |
| **Jobs** | `GET` | `/api/v1/jobs` | Search & filter published job postings |
| **Jobs** | `POST` | `/api/v1/jobs` | Post new job (Employer only) |
| **Applications** | `POST` | `/api/v1/applications` | Apply for job with CV |
| **Screening** | `GET` | `/api/v1/screening/:applicationId` | View AI screening score & feedback |
| **Bookings** | `GET` | `/api/v1/bookings/slots` | Browse available consultation slots |
| **Bookings** | `POST` | `/api/v1/bookings/book` | Book consultation slot (Transaction-safe) |
| **Payments** | `POST` | `/api/v1/payments/checkout` | Create Stripe checkout session |
| **Payments** | `POST` | `/api/v1/payments/webhook` | Process Stripe subscription webhooks |
| **Admin** | `GET` | `/api/v1/admin/metrics` | Platform overview (Admin only) |
