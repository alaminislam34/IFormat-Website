const PLACEHOLDER_RESUME_TEXT =
  "Candidate submitted resume via direct portal application.";

const METADATA_ONLY_KEYS = new Set([
  "fileName",
  "fileSize",
  "fileType",
  "mimeType",
  "uploadedAt",
  "url",
  "fileUrl",
  "source",
  "parseStatus",
  "storedName",
]);

const DEMO_RESUME_MARKERS = [
  "sifat70640@gmail.com",
  "md sifat islam",
  "alex.morgan@example.com",
  "senior full stack & ai architect",
];

function asRecord(content: unknown): Record<string, any> | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }
  return content as Record<string, any>;
}

function collectStructuredText(content: Record<string, any>): string {
  const parts: string[] = [];

  const push = (value: unknown) => {
    if (typeof value === "string" && value.trim()) {
      parts.push(value.trim());
    }
  };

  push(content.fullName);
  push(content.jobTitle);
  push(content.summary);
  push(content.raw_text);
  push(content.rawText);

  if (Array.isArray(content.workExperience)) {
    for (const job of content.workExperience) {
      push(job?.role);
      push(job?.company);
      push(job?.description);
    }
  }

  if (Array.isArray(content.experiences)) {
    for (const job of content.experiences) {
      push(job?.role);
      push(job?.company);
      push(job?.description);
    }
  }

  if (Array.isArray(content.education)) {
    for (const edu of content.education) {
      push(edu?.degree);
      push(edu?.institution);
    }
  }

  if (Array.isArray(content.skillGroups)) {
    for (const group of content.skillGroups) {
      push(group?.category);
      push(group?.skills);
    }
  }

  if (Array.isArray(content.skills)) {
    parts.push(content.skills.filter((s: unknown) => typeof s === "string").join(", "));
  }

  if (content.personal && typeof content.personal === "object") {
    push(content.personal.name);
    push(content.personal.summary);
  }

  return parts.filter(Boolean).join("\n");
}

export function isDemoResumeTemplate(content: unknown): boolean {
  const blob = JSON.stringify(content || "").toLowerCase();
  return DEMO_RESUME_MARKERS.some((marker) => blob.includes(marker));
}

export function getResumePlainText(content: unknown): string {
  const record = asRecord(content);
  if (!record) {
    return typeof content === "string" ? content.trim() : "";
  }

  if (typeof record.raw_text === "string" && record.raw_text.trim()) {
    const raw = record.raw_text.trim();
    if (raw !== PLACEHOLDER_RESUME_TEXT) {
      return raw;
    }
  }

  return collectStructuredText(record);
}

export function isUsableResumeContent(content: unknown): boolean {
  if (isDemoResumeTemplate(content)) {
    return false;
  }

  const text = getResumePlainText(content);
  if (!text || text === PLACEHOLDER_RESUME_TEXT) {
    return false;
  }

  return text.replace(/\s+/g, "").length >= 80;
}

/**
 * Keys that should never be forwarded to the AI screening service.
 * These are storage/metadata fields (URLs, binary blobs) that bloat the
 * Bedrock Converse payload and can trigger "length limit exceeded" errors.
 */
const SCREENING_STRIP_KEYS = new Set([
  "fileUrl", "url", "fileSize", "fileType", "mimeType",
  "uploadedAt", "storedName", "parseStatus",
]);

/** Max characters of resume text sent to AI screening (~7,000 words). */
const MAX_SCREENING_TEXT_LENGTH = 35_000;

function capText(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit) + "\n...[content truncated for AI screening]";
}

/**
 * Returns true when a value is a data-URI, base64 blob, or any string
 * large enough to blow past Bedrock's payload budget.
 */
function isOversizedOrBinary(value: unknown): boolean {
  if (typeof value !== "string") return false;
  if (value.startsWith("data:")) return true;
  // Any single string field > 50 KB is almost certainly not resume prose
  if (value.length > 50_000) return true;
  return false;
}

/**
 * Builds a lightweight, AI-safe JSON payload from the stored CV content.
 * - Strips storage metadata, file URLs, and binary/base64 blobs.
 * - Caps raw resume text to MAX_SCREENING_TEXT_LENGTH.
 */
export function buildScreeningCvJson(content: unknown, userInfo: Record<string, any>) {
  const record = asRecord(content) || {};
  let rawText = capText(getResumePlainText(record), MAX_SCREENING_TEXT_LENGTH);

  if (typeof record.fullName === "string" || Array.isArray(record.workExperience) || Array.isArray(record.experiences)) {
    // Structured CV — shallow-copy only safe keys
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(record)) {
      if (SCREENING_STRIP_KEYS.has(key)) continue;
      if (isOversizedOrBinary(value)) continue;
      cleaned[key] = value;
    }
    return {
      ...cleaned,
      personal: {
        name: userInfo.name,
        email: userInfo.email,
        phone: userInfo.phone,
        ...(record.personal || {}),
      },
    };
  }

  return {
    source: record.source || "pdf_upload",
    fileName: record.fileName,
    raw_text: rawText,
    personal: {
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
    },
  };
}

export function describeUnusableResume(content: unknown): string {
  if (isDemoResumeTemplate(content)) {
    return "The attached resume is still the built-in demo developer template, not the candidate's own profile.";
  }

  const record = asRecord(content);
  const looksLikePdfMetadata =
    !!record &&
    Object.keys(record).every((key) => METADATA_ONLY_KEYS.has(key)) &&
    Boolean(record.fileName || record.fileType);

  if (looksLikePdfMetadata) {
    return "A PDF filename was stored, but the resume file was never parsed, so there is no candidate experience to score.";
  }

  return "No readable resume text was attached to this application.";
}
