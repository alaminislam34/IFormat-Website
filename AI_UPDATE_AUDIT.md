# AI Usage Tracking, Feedback & Analytics: Update Audit

**তারিখ:** ১৬ অক্টোবর ২০২৬
**Scope:** `iformat-backend` (Express + Prisma + PostgreSQL) ও `iformat` (Next.js)
**Status:** কোড লেখা ও typecheck শেষ। Production-এ deploy ও নিচের checklist যাচাই বাকি।
**ব্যবহার:** এই ফাইল দেখে ক্রমানুসারে deploy করুন, তারপর Section 6-এর checklist মিলিয়ে নিন।

> এই audit শুধু **AI update (Phase 1)** নিয়ে। একই working tree-তে আগের **Job Post update** (country/city, AED/SAR, নতুন category) এর পরিবর্তনও আছে। দুটো একসাথে deploy হলে database-এর পরিবর্তন Section 4-এ দেখুন।

---

## 1. সারসংক্ষেপ

| # | কী বদলেছে | কেন |
|---|---|---|
| 1 | প্রতিটি AI call-এর metadata `AiUsageLog` table-এ জমা হয় | কোন feature কত চলে, কত খরচ, কত ব্যর্থ, তা জানতে |
| 2 | AI-র উত্তরের সাথে `usageId` ফেরত আসে | user-এর rating ওই নির্দিষ্ট result-এর সাথে বাঁধতে |
| 3 | `POST /api/v1/ai/feedback` (👍/👎 + মন্তব্য) | AI-র quality মাপতে |
| 4 | `GET /api/v1/admin/ai-analytics` | admin dashboard-এর তথ্য |
| 5 | Admin → Monetization → **AI Analytics** page | খরচ, ব্যবহার, quality এক জায়গায় দেখতে |
| 6 | 4টি user screen-এ "Was this helpful?" widget | rating সংগ্রহ |

**যা সংরক্ষণ হয় না:** prompt, CV-র লেখা, AI-র উত্তর। শুধু metadata। তাই ব্যক্তিগত তথ্য জমে না।

---

## 2. কীভাবে কাজ করে (data flow)

```
User request
  -> trackAi(feature) middleware        (user ও feature মনে রাখে, AsyncLocalStorage-এ)
  -> AIService -> AIClient              (সব AI call এখান দিয়ে যায়)
       -> trackAiCall(): সময় মাপে, উত্তর/ব্যর্থতা ধরে
            -> background-এ AiUsageLog লেখে   (ব্যর্থ হলেও user-এর request আটকায় না)
  -> controller: withUsageId(result)    (উত্তরে usageId যোগ করে)
  -> Frontend: <AiFeedback usageId=... />
       -> POST /ai/feedback -> ওই row-এ rating/comment বসে
Admin page -> GET /admin/ai-analytics -> aggregate হিসাব
```

**মূল সিদ্ধান্ত:** logging `AIClient`-এ এক জায়গায়, তাই নতুন AI feature যোগ করলেও আলাদা কিছু করতে হয় না।

---

## 3. ফাইল তালিকা

### 3.1 Backend (নতুন)

| ফাইল | কাজ |
|---|---|
| [ai.prisma](iformat-backend/prisma/schema/ai.prisma) | `AiUsageLog` model ও enum (`AiFeature`, `AiCallStatus`, `AiFeedbackRating`) |
| [ai-context.ts](iformat-backend/src/lib/ai-context.ts) | request-ভিত্তিক context (user, feature), `trackAi` middleware, `withUsageId` |
| [ai-usage-logger.ts](iformat-backend/src/lib/ai-usage-logger.ts) | `trackAiCall()`: সময় মাপা, status ঠিক করা, background-এ log লেখা, plan বের করা |
| [ai-analytics.service.ts](iformat-backend/src/modules/ai-analytics/ai-analytics.service.ts) | admin-এর সব হিসাব (summary, feature, plan, daily, top users, errors, feedback) |

### 3.2 Backend (পরিবর্তিত)

| ফাইল | পরিবর্তন |
|---|---|
| [ai-client.ts](iformat-backend/src/lib/ai-client.ts) | ৭টি public method `trackAiCall` দিয়ে মোড়ানো |
| [ai.route.ts](iformat-backend/src/modules/ai/ai.route.ts) | প্রতি route-এ `trackAi(...)`; নতুন `POST /feedback` |
| [ai.controller.ts](iformat-backend/src/modules/ai/ai.controller.ts) | সব উত্তরে `withUsageId`; `submitFeedback` |
| [ai.service.ts](iformat-backend/src/modules/ai/ai.service.ts) | `submitFeedback` (শুধু নিজের result-এ) |
| [ai.validation.ts](iformat-backend/src/modules/ai/ai.validation.ts) | `aiFeedbackSchema` |
| [screening.service.ts](iformat-backend/src/modules/screening/screening.service.ts) | screening-এর খরচ job-এর employer-এর নামে লেখা হয় |
| [admin.route.ts](iformat-backend/src/modules/admin/admin.route.ts), [admin.controller.ts](iformat-backend/src/modules/admin/admin.controller.ts) | `/admin/ai-analytics` |
| [user.prisma](iformat-backend/prisma/schema/user.prisma) | `aiUsageLogs` relation |
| [env.ts](iformat-backend/src/config/env.ts) | `AI_COST_PER_1M_TOKENS_USD` |
| `.env.example`, `.env.docker.example`, `docker-compose.yml`, `docker-compose.prod.yml` | নতুন env পাস করা |

### 3.3 Frontend (নতুন)

| ফাইল | কাজ |
|---|---|
| [ai-feedback.tsx](iformat/src/components/ui/ai-feedback.tsx) | 👍/👎 widget |
| [ai-analytics/page.tsx](iformat/src/app/(admin)/admin/ai-analytics/page.tsx) | admin page |
| [ai-kpi-grid.tsx](iformat/src/features/admin/components/ai-analytics/ai-kpi-grid.tsx) | ৪টি KPI card |
| [ai-daily-chart.tsx](iformat/src/features/admin/components/ai-analytics/ai-daily-chart.tsx) | দৈনিক call chart + table view |
| [ai-breakdown-tables.tsx](iformat/src/features/admin/components/ai-analytics/ai-breakdown-tables.tsx) | feature/plan/user table, failure ও feedback তালিকা |
| [ai-analytics-utils.ts](iformat/src/features/admin/components/ai-analytics/ai-analytics-utils.ts) | label ও format helper |

### 3.4 Frontend (পরিবর্তিত)

| ফাইল | পরিবর্তন |
|---|---|
| [ai.service.ts](iformat/src/services/ai.service.ts) | `generateCoverLetter`/`generateEmail` এখন পুরো DTO ফেরত দেয় (আগে শুধু string); `submitFeedback` |
| [admin.service.ts](iformat/src/services/admin.service.ts) | `getAiAnalytics` ও type |
| [types/api/ai.ts](iformat/src/types/api/ai.ts) | `usageId` ও rating type |
| [cover-letter-generator.tsx](iformat/src/features/job-assistant/components/cover-letter-generator.tsx), [email-generator.tsx](iformat/src/features/job-assistant/components/email-generator.tsx) | widget বসানো, নতুন return shape |
| [job-analyzer-modal.tsx](iformat/src/features/jobs/components/modal/job-analyzer-modal.tsx) | widget |
| [use-resume-state.ts](iformat/src/features/job-assistant/hooks/use-resume-state.ts), [resume-builder.tsx](iformat/src/features/job-assistant/components/resume-builder.tsx) | CV builder-এ widget |
| [admin layout](iformat/src/app/(admin)/admin/layout.tsx) | sidebar-এ "AI Analytics" |

---

## 4. Database পরিবর্তন

**নতুন table `AiUsageLog`** (শুধু যোগ হয়, কিছু মুছে না):

| Column | অর্থ |
|---|---|
| `id` | uuid (server আগেই বানায়, তাই response-এ ফেরত দেওয়া যায়) |
| `userId` | user মুছলে `NULL` হয়, row থাকে (aggregate ঠিক থাকে) |
| `role`, `planCode` | কে ও কোন plan-এ (`ADMIN`, `FREE_TIER`, paid code) |
| `feature` | `COVER_LETTER`, `COLD_EMAIL`, `RESUME_OPTIMIZER`, `CV_BUILD`, `PRODUCT_RECOMMEND`, `CAREER_CHAT`, `JOB_ANALYSIS`, `CANDIDATE_SCREENING` |
| `status` | `SUCCESS`, `ERROR`, `TIMEOUT` |
| `model`, `tokensUsed`, `latencyMs` | AI service থেকে ও মাপা সময় |
| `errorMessage` | সর্বোচ্চ ৩০০ অক্ষর |
| `feedbackRating`, `feedbackComment`, `feedbackAt` | user-এর rating (ঐচ্ছিক) |
| `createdAt` | সময় |

Index: `createdAt`, `(feature, createdAt)`, `(userId, createdAt)`, `(status, createdAt)`, `(feedbackRating, feedbackAt)`।

**একসাথে Job Post update deploy হলে** `JobPosting`-এ আরও যোগ হয়: `country`, `city`, `originalCategory` (সবই optional)। এছাড়া server চালু হলে `migrateLegacyJobData()` পুরনো job-এর `workplaceType` ও category বদলে নতুন তালিকায় আনে, পুরনো category `originalCategory`-তে রেখে।

---

## 5. API পরিবর্তন

| Method | Path | কে | বিবরণ |
|---|---|---|---|
| `POST` | `/api/v1/ai/feedback` | লগইন করা candidate/admin | body: `{ usageId (uuid), rating: "UP"\|"DOWN", comment? (<=500) }`। অন্যের result হলে 404 |
| `GET` | `/api/v1/admin/ai-analytics?days=7\|30\|90` | admin | অন্য মান দিলে 30 ধরা হয় |
| (বিদ্যমান ৭টি AI endpoint) | `/api/v1/ai/*` | অপরিবর্তিত | উত্তরে অতিরিক্ত optional field `usageId` |

**Breaking change:** নেই। `usageId` শুধু যোগ হয়েছে। Frontend-এ `aiService.generateCoverLetter`/`generateEmail`-এর return type string থেকে object হয়েছে, এই repo-র তিনটি ব্যবহারস্থলই ঠিক করা হয়েছে (`apply-modal` আগে থেকেই object সামলাত)।

---

## 6. Deploy ও যাচাই checklist (আগামীকালের কাজ)

### 6.1 Deploy-এর আগে
- [ ] Production database-এর **backup** নিন
- [ ] `.env.production`-এ `AI_COST_PER_1M_TOKENS_USD` যোগ করুন (না দিলে `0`, খরচের column লুকানো থাকবে। মান বের করার নিয়ম আলাদা নোটে বলা আছে: AWS Bedrock বিলকে মোট token দিয়ে ভাগ করে ১০ লক্ষ গুণ)
- [ ] `git diff` দেখে নিন, বিশেষ করে Section 3-এর ফাইলগুলো
- [ ] আপনার নিয়ম: commit-এ Claude attribution/Co-Authored-By থাকবে না

### 6.2 Deploy ক্রম
1. [ ] **Backend আগে** deploy করুন (`db push` নতুন table বানাবে। log দেখুন: "Your database is now in sync")
2. [ ] Log-এ error নেই তা নিশ্চিত করুন; Job update সহ হলে "Migrated legacy job data: ..." লাইন আসতে পারে
3. [ ] **তারপর frontend** deploy করুন

### 6.3 Database যাচাই
- [ ] table আছে: `SELECT count(*) FROM "AiUsageLog";`
- [ ] কোন model চলছে: `SELECT model, count(*) FROM "AiUsageLog" GROUP BY model;`
- [ ] status বিভাজন: `SELECT status, count(*) FROM "AiUsageLog" GROUP BY status;`
- [ ] কোনো কাঁচা তথ্য নেই (কোনো column-এ CV/prompt নেই, `errorMessage` ছোট)

### 6.4 Functional যাচাই (একটি test candidate account দিয়ে)
- [ ] Cover letter generate করুন, তারপর `AiUsageLog`-এ একটি `COVER_LETTER / SUCCESS` row আসে
- [ ] Email generate: `COLD_EMAIL` row
- [ ] Job analyzer চালান (CV সহ): `JOB_ANALYSIS` row। CV ছাড়া চালালে AI call হয় না, তাই row ও widget দুটোই না আসা ঠিক
- [ ] CV builder: `CV_BUILD` row, step 6-এ widget
- [ ] Employer-এর candidate screening: `CANDIDATE_SCREENING` row, `userId` = **employer** (candidate নয়)
- [ ] 👍 চাপলে সাথে সাথে "Thanks for your feedback"; DB-তে `feedbackRating = UP`
- [ ] 👎 চাপলে comment box আসে; পাঠালে `DOWN` ও comment জমা হয়
- [ ] নতুন generate করলে widget নতুন করে শুরু হয় (আগের rating মনে থাকে না)
- [ ] Guest demo উত্তরে (লগইন ছাড়া) widget **দেখা যায় না**

### 6.5 ব্যর্থতার পথ
- [ ] AI service বন্ধ/ভুল URL দিলে user আগের মতোই error দেখে (আচরণ বদলায়নি) এবং `ERROR`/`TIMEOUT` row জমা হয়
- [ ] Quota শেষ হলে (403) AI call-ই হয় না, তাই row জমে না। এটা ঠিক আচরণ
- [ ] অন্য user-এর `usageId` দিয়ে `POST /ai/feedback` করলে 404

### 6.6 Admin page (`/admin/ai-analytics`)
- [ ] Sidebar-এ Monetization-এর নিচে "AI Analytics" দেখা যায়
- [ ] ৭d / ৩০d / ৯০d বদলালে তথ্য বদলায়
- [ ] KPI-র সংখ্যা DB-র `count(*)`-এর সাথে মেলে
- [ ] Chart-এ কোনো column hover করলে tooltip আসে; "View as table" খোলে
- [ ] `AI_COST_PER_1M_TOKENS_USD` সেট না থাকলে "Est. cost" column ও খরচ লুকানো; সেট থাকলে দেখায়
- [ ] **Super admin-এর call কোথাও দেখা যায় না** (top users, errors, feedback সহ)
- [ ] Admin-এর নিজের AI call `planCode = ADMIN` হিসেবে আসে (তালিকায় ADMIN সারি আসাটা স্বাভাবিক)
- [ ] ছোট মোবাইল/ট্যাবলেট width-এ page ভেঙে যায় না

### 6.7 Regression (আগের কাজ ভাঙেনি তো?)
- [ ] AI quota গণনা আগের মতো: free user ৫টির পর আটকায়
- [ ] Apply modal-এ "AI Draft" cover letter আগের মতো কাজ করে
- [ ] Job apply করলে auto-screening চলে ও ফলাফল আসে

---

## 7. নিরাপত্তা ও গোপনীয়তা

| বিষয় | অবস্থা |
|---|---|
| ব্যক্তিগত তথ্য (CV, prompt, উত্তর) | সংরক্ষণ **হয় না** |
| `errorMessage`-এ গোপন তথ্য | ৩০০ অক্ষরে কাটা; AI service-এর error বার্তা মাঝে মাঝে ইনপুটের অংশ ফেরত দিলে সেটা এখানে আসতে পারে। 🔎 প্রথম কয়েকদিন এই column একবার দেখে নিন |
| Feedback comment | user-এর লেখা, সর্বোচ্চ ৫০০ অক্ষর। React escape করে দেখায় (XSS নেই) |
| Admin access | `requireAdmin` দিয়ে সুরক্ষিত |
| অন্যের result-এ rating | `WHERE id AND userId` শর্তে আটকানো |
| User account মুছলে | log থাকে কিন্তু `userId = NULL`, তাই ব্যক্তির সাথে আর যুক্ত থাকে না |
| Privacy Policy | metadata সংরক্ষণ হয় বলে এক লাইন যোগ করার কথা ভাবুন (prompt সংরক্ষণ শুরু করলে বাধ্যতামূলক) |

---

## 8. সীমাবদ্ধতা ও জানা বিষয়

1. **খরচ আনুমানিক।** AI service শুধু মোট token জানায় (input/output আলাদা নয়), তাই এক গড় দামে হিসাব হয়। নির্ভুল করতে হলে AI service থেকে `inputTokens`/`outputTokens` আলাদা আনতে হবে।
2. **`planCode = UNKNOWN`**: user ছাড়া (context-হীন) call-এ দেখায়। কম হওয়ার কথা।
3. **একই request-এ একাধিক AI call** হলে শেষটির `usageId` ফেরত যায় (বর্তমানে প্রতি request-এ একটিই call)।
4. **পুরনো log মোছার ব্যবস্থা নেই।** তথ্য ছোট (শুধু metadata), তবে কয়েক মাস পর cleanup job ভাবা ভালো।
5. **Rating widget নেই:** resume optimizer, product recommender, career chat-এ (frontend এগুলো এখনো ব্যবহার করে না। backend `usageId` ফেরত দেয়)।
6. **Employer** (screening) rating দিতে পারে না। `/ai/*` router শুধু candidate/admin-এর জন্য।
7. **Latency মাপা হয় প্রতি call-এর** (AI service-এর ভেতরে নয়, backend থেকে মাপা)।
8. `percentile_cont` ও `date_trunc` PostgreSQL-নির্ভর (আপনার database PostgreSQL, তাই ঠিক)।

---

## 9. আগেই যা পরীক্ষা হয়েছে (এবং যা হয়নি)

**পরীক্ষা হয়েছে:**
- Frontend ও backend `tsc` পাস
- আলাদা Docker PostgreSQL-এ AI service নকল করে: সফল/error/timeout log, context ছাড়া call, feedback জমা, অন্যের result-এ feedback প্রত্যাখ্যান, সব analytics হিসাব (summary, feature, plan, daily, top users, errors, feedback), super admin বাদ (Prisma ও raw SQL দুই পথেই)
- Admin component নমুনা তথ্য দিয়ে screenshot নিয়ে চোখে দেখা

**পরীক্ষা হয়নি (উপরের Section 6 দিয়ে করতে হবে):**
- আসল AI service ও আসল database-এর সাথে পুরো প্রবাহ
- আসল admin account দিয়ে login করে page
- 👍/👎 widget আসল backend-এর সাথে
- মোবাইল width
- Production-এর `db push`

---

## 10. Rollback

- সব পরিবর্তন **additive**। AI-র আচরণ বদলায়নি, শুধু একটি অতিরিক্ত field ও background log।
- কিছু ভুল হলে: frontend আগের version-এ ফেরান, backend আগের version-এ ফেরান। নতুন table পড়ে থাকলে ক্ষতি নেই।
- সম্পূর্ণ মুছতে চাইলে (শেষ উপায়):
  ```sql
  DROP TABLE "AiUsageLog";
  DROP TYPE "AiFeature"; DROP TYPE "AiCallStatus"; DROP TYPE "AiFeedbackRating";
  ```
- Job update-এর category পরিবর্তন ফেরাতে: `UPDATE "JobPosting" SET category = "originalCategory" WHERE "originalCategory" IS NOT NULL;`

---

## 11. পরবর্তী ধাপ (Phase 2 প্রস্তাব)

| অগ্রাধিকার | কাজ |
|---|---|
| 🔴 | AI service থেকে input/output token আলাদা আনা, নির্ভুল খরচের জন্য |
| 🟡 | আচরণ-সংকেত: copy, download, regenerate (কোন উত্তর সত্যিই কাজে লাগছে) |
| 🟡 | Free থেকে paid-এ রূপান্তরের হিসাব (কোন feature-এর পর upgrade হয়) |
| 🟡 | পুরনো log মোছার scheduled job (retention) |
| 🟢 | পূর্ণ prompt/উত্তর সংরক্ষণ (আগে Privacy Policy ও retention নীতি) |
| 🟢 | খরচ বা error হার সীমা ছাড়ালে admin-কে সতর্কতা |
