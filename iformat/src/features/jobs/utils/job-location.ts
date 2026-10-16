import { WORK_MODES } from "../constants/job-options.constants";

interface JobLocationSource {
  country?: string | null;
  city?: string | null;
  location?: string | null;
  workplaceType?: string | null;
}

const isWorkMode = (value?: string | null): boolean =>
  !!value && (WORK_MODES as readonly string[]).includes(value);

/**
 * Work mode (Remote / Onsite / Hybrid). Older postings stored the mode in
 * `location`, so that wins when it is one of the three modes.
 */
export function getJobWorkMode(job: JobLocationSource): string {
  if (isWorkMode(job.location)) return job.location as string;
  return job.workplaceType || "Remote";
}

/** Physical place (e.g. "Riyadh, Saudi Arabia"), or "" for remote-only postings. */
export function getJobPlace(job: JobLocationSource): string {
  const structured = [job.city, job.country]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(", ");
  if (structured) return structured;
  const place = job.location?.trim() ?? "";
  return isWorkMode(place) ? "" : place;
}

/** Single display string, e.g. "Riyadh, Saudi Arabia · Onsite" or "Remote". */
export function formatJobLocation(job: JobLocationSource): string {
  const mode = getJobWorkMode(job);
  const place = getJobPlace(job);
  return place ? `${place} · ${mode}` : mode;
}
