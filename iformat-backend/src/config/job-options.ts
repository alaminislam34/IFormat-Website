/** Canonical job option lists. Keep in sync with iformat/src/features/jobs/constants/job-options.constants.ts */
export const JOB_CATEGORIES = [
  "Executive Leadership & Management",
  "Business, Marketing & Communications",
  "Human Resources & Administration",
  "Finance, Banking & Investment",
  "Legal, Governance, Risk & Compliance",
  "Strategy, Consulting & Business Development",
  "Technology, Engineering, Data & AI",
  "Project Management & Operations",
  "Construction, Real Estate & Infrastructure",
  "Logistics, Supply Chain & Fleet Management",
  "Energy, Manufacturing & Industrial",
  "Healthcare, Education & Life Sciences",
  "Government & Public Sector",
  "Retail, Hospitality, Tourism & Events",
  "Other",
] as const;

export const WORK_MODES = ["Remote", "Onsite", "Hybrid"] as const;

/** Category names used before the list above, mapped to their replacement. */
export const LEGACY_CATEGORY_MAP: Record<string, (typeof JOB_CATEGORIES)[number]> = {
  "Technology & Engineering": "Technology, Engineering, Data & AI",
  "Data & AI": "Technology, Engineering, Data & AI",
  "Design & Creative": "Business, Marketing & Communications",
  "Business & Marketing": "Business, Marketing & Communications",
  "Finance & Operations": "Finance, Banking & Investment",
  "Product & Management": "Project Management & Operations",
};

/** Display string stored in `location`, e.g. "Riyadh, Saudi Arabia"; falls back to the work mode. */
export function buildLocationLabel(parts: {
  city?: string | null;
  country?: string | null;
  location?: string | null;
  workplaceType?: string | null;
}): string {
  const place = [parts.city, parts.country]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ");
  return place || parts.location?.trim() || parts.workplaceType || "Remote";
}
