# iFormat Website — Remaining Work & Action Checklist

This document details all remaining issues, pending features, and testing requirements identified from the client feedback (Jessica V).

---

## 📌 Status Summary

| # | Task / Issue | Area | Priority | Status |
|---|---|---|---|---|
| **1** | Job Application CV Upload Error (500 Error Fix) | Frontend & Backend | 🔴 High | Ready to implement |
| **2** | Spam Folder Notice Below Login Form | Frontend (`/login`) | 🟡 Medium | Ready to implement |
| **3** | Membership Duration Toggle (6 vs. 12 Months) | Frontend & Backend | 🔴 High | Ready to implement |
| **4** | Top 3 Products Update on Landing Page | Frontend (`services`) | 🟡 Medium | Ready to implement |
| **5** | Soft-Delete / Delete Company Action in Admin | Frontend (`/admin/companies`) | 🟡 Medium | Ready to implement |
| **6** | Partner Logos Marquee & Grayscale Styling | Frontend (`partners`) | 🟢 Low | Ready to implement |
| **7** | Production Admin Access Verification for iFormat | Database / Deployment | 🔴 High | Ops / Config verification |
| **8** | Mock Purchases QA for Memberships | Payments / Notifications | 🟡 Medium | QA Testing |
| **9** | Website Visitor Analytics Setup (GA4 / PostHog) | Infrastructure / Tracking | 🟢 Low | Advisory / Optional |

---

## 🛠 Detailed Breakdown of Remaining Work

### 1. Fix Job Application PDF Upload Error
* **Client Report:** *"Tried applying for the job again today, same error"* / *"Unable to apply for jobs, receiving an error code when uploading a PDF document CV"*.
* **Current Error:** `⚠ An internal server error. Please contact support` displayed inline below the CV upload input.
* **Target Files:**
  * [`iformat/src/features/jobs/components/apply-modal.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/jobs/components/apply-modal.tsx)
  * [`iformat-backend/src/modules/cv/cv.route.ts`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat-backend/src/modules/cv/cv.route.ts)
  * [`iformat-backend/src/modules/cv/cv.controller.ts`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat-backend/src/modules/cv/cv.controller.ts)
* **Required Implementation:**
  * Ensure the file upload endpoint gracefully handles candidate applications without requiring a pre-existing authenticated candidate session.
  * Implement robust error handling so PDF parsing or storage failures do not fail with an uncaught 500 error.
  * Provide fallback handling for local and cloud storage buffers.

---

### 2. Add Spam Warning Below Login Form
* **Client Report:** *"We need to make sure there is a message here to say, that they need to check spam message right below logins, to make sure they check their email in spam folder if they do not see it in their inbox."*
* **Target File:**
  * [`iformat/src/app/login/page.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/app/login/page.tsx)
* **Required Implementation:**
  * Insert a subtle alert/notice card directly underneath the "Sign in" and "Google" buttons.
  * Message:
    > *"Expecting an email or verification code? Please check your **Spam or Junk folder** if it does not appear in your inbox within a few minutes, or add **info@iformatbranding.com** to your safe sender list."*

---

### 3. Membership Choice: 6 Months vs. 12 Months
* **Client Report:** *"Lastly, the memberships are a choice between 6 and 12 months, can we have this updated please."*
* **Target Files:**
  * [`iformat/src/features/landing/components/pricing.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/landing/components/pricing.tsx)
  * [`iformat/src/features/landing/components/pricing-header.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/landing/components/pricing-header.tsx)
  * [`iformat/src/features/landing/components/pricing-card.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/landing/components/pricing-card.tsx)
  * [`iformat/src/features/billing/components/plan-switcher-grid.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/billing/components/plan-switcher-grid.tsx)
* **Required Implementation:**
  * Implement a 2-way switcher on the pricing section: **"6 Months Commitment"** vs **"12 Months Commitment"**.
  * Adjust plan pricing/discounts and commitment labels based on the chosen period.
  * Ensure the selected interval is passed correctly into the checkout/billing flow.

---

### 4. Update Top 3 Products Displayed on Landing Page
* **Client Report:** *"Top 3 products that need to be displayed on the website need to be: 1. Brand Equity Builder, 2. Executive Strategic CV and Linkedin, 3. Career Hunting Readiness"*.
* **Target Files:**
  * [`iformat/src/features/services/data/services-data.ts`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/services/data/services-data.ts)
  * [`iformat/src/stores/use-services-store.ts`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/stores/use-services-store.ts)
  * [`iformat/src/features/landing/components/services.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/landing/components/services.tsx)
* **Required Implementation:**
  * Update product titles to match the exact requested names:
    1. **Brand Equity Builder** (replaces "Personal Brand Builder")
    2. **Executive Strategic CV and Linkedin** (replaces "Strategic Corporate & Founder Branding")
    3. **Career Hunting Readiness** (replaces "Career Hosting & Portfolio Package")
  * Ensure these three products are ordered as items 1, 2, and 3 in the default active services list.

---

### 5. Add "Delete / Soft Delete Company" Action in Admin Portal
* **Client Report:** *"We should be able to delete companies, especially if there are people creating fake companies and fake jobs, we can already delete jobs, we should be able to delete or soft delete company details so that we don't have duplicates or fake companies and we can moderate."*
* **Target Files:**
  * [`iformat/src/app/(admin)/admin/companies/page.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/app/(admin)/admin/companies/page.tsx)
  * [`iformat/src/services/admin.service.ts`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/services/admin.service.ts)
* **Required Implementation:**
  * Add a "Delete Company" button (with trash icon) in the actions column for each company in the Admin Companies management table.
  * Add a confirmation modal warning the admin that deleting the company will soft-delete the employer profile and hide associated job posts.
  * Connect the action to `adminService.softDeleteUser(companyId)`.

---

### 6. Partner Logos Marquee & Grayscale Styling
* **Client Report:** *"This also needs to be changed, they initially had the logos in grey and it was flowing from the right to the left."*
* **Target File:**
  * [`iformat/src/features/landing/components/partners.tsx`](file:///home/alaminmindmatrix/Office%20Projects/IFormat-Website/iformat/src/features/landing/components/partners.tsx)
* **Required Implementation:**
  * Change static grid to an infinite horizontal marquee/ticker.
  * Style logos with CSS `grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all`.
  * Ensure continuous smooth animation flowing from right to left (`translate-x`).

---

### 7. Production Admin Access Verification for iFormat Team
* **Client Report:** *"iFormat is still not an administrator on the portal admin panel"* (Screenshot shows `devamin.bd@gmail.com` logged in as the only admin).
* **Action:**
  * Run the database seed in production or assign the `ADMIN` role to Jessica's account (`jessica@iformatbranding.com`) and `admin@iformatbranding.com`.
  * Provide login credentials to the client so they can access the panel under their own branding.

---

### 8. QA Testing for Membership Purchases
* **Client Report:** *"can your team also do a mock purchase of all 3 memberships to see if we get the notifications and contact details"*
* **Action:**
  * Perform a test transaction for Starter ($149), Professional ($449), and Grow ($299).
  * Confirm that email notifications arrive at `info@iformatbranding.com`.

---

### 9. Website Visitor Analytics (Advisory Note)
* **Client Report:** *"Is there a way to check how many visits to our website we get, like the analytics for the site, is that something that AWS monitors?"*
* **Recommendation:**
  * Advise Jessica that AWS only monitors server/infrastructure traffic (HTTP hits), not user-level engagement.
  * Integrate **Google Analytics 4 (GA4)** script into `layout.tsx` with a dashboard for tracking visits, sessions, and visitor origins.
