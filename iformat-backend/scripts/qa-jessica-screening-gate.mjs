/**
 * QA harness for Jessica's screening bug:
 * - unusable CVs must not be scored as Backend Developer
 * - real Brand Equity profiles must be treated as usable
 * - uploaded PDFs must yield readable text
 */
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, name, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ PASS  ${name}`);
  } else {
    failed++;
    failures.push(name + (detail ? ` — ${detail}` : ""));
    console.error(`  ❌ FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

// Mirror production helpers from src/modules/cv/cv-content.ts
const PLACEHOLDER = "Candidate submitted resume via direct portal application.";
const DEMO_MARKERS = [
  "sifat70640@gmail.com",
  "md sifat islam",
  "alex.morgan@example.com",
  "senior full stack & ai architect",
];

function isDemo(content) {
  const blob = JSON.stringify(content || "").toLowerCase();
  return DEMO_MARKERS.some((m) => blob.includes(m));
}

function collectStructured(content) {
  const parts = [];
  const push = (v) => {
    if (typeof v === "string" && v.trim()) parts.push(v.trim());
  };
  push(content.fullName);
  push(content.jobTitle);
  push(content.summary);
  push(content.raw_text);
  if (Array.isArray(content.workExperience)) {
    for (const job of content.workExperience) {
      push(job?.role);
      push(job?.company);
      push(job?.description);
    }
  }
  return parts.join("\n");
}

function getText(content) {
  if (!content || typeof content !== "object") return "";
  if (typeof content.raw_text === "string" && content.raw_text.trim() && content.raw_text.trim() !== PLACEHOLDER) {
    return content.raw_text.trim();
  }
  return collectStructured(content);
}

function isUsable(content) {
  if (isDemo(content)) return false;
  const text = getText(content);
  if (!text || text === PLACEHOLDER) return false;
  return text.replace(/\s+/g, "").length >= 80;
}

function decodePdfLiteral(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

function stringsFromContentStream(decoded) {
  const parts = [];
  for (const match of decoded.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
    const inner = match[0].slice(1, -1);
    const text = decodePdfLiteral(inner).trim();
    if (text.length >= 2 && /[A-Za-z]/.test(text)) parts.push(text);
  }
  return parts;
}

function inflatePdfStream(payload) {
  for (const attempt of [
    (buf) => zlib.inflateSync(buf),
    (buf) => zlib.unzipSync(buf),
    (buf) => zlib.inflateRawSync(buf),
  ]) {
    try {
      return attempt(payload).toString("latin1");
    } catch {
      /* next */
    }
  }
  return payload.toString("latin1");
}

function stripStreamEol(data) {
  if (data.endsWith("\r\n")) return data.slice(0, -2);
  if (data.endsWith("\n") || data.endsWith("\r")) return data.slice(0, -1);
  return data;
}

function extractStreamPayloads(source) {
  const payloads = [];
  const headerRe = /<<([\s\S]*?)>>\s*stream(\r\n|\n|\r)?/g;
  let match;
  while ((match = headerRe.exec(source)) !== null) {
    const dict = match[1];
    const dataStart = match.index + match[0].length;
    const lengthMatch = dict.match(/\/Length\s+(\d+)/);
    let raw;
    if (lengthMatch) {
      raw = source.slice(dataStart, dataStart + Number(lengthMatch[1]));
    } else {
      const end = source.indexOf("endstream", dataStart);
      if (end < 0) continue;
      raw = stripStreamEol(source.slice(dataStart, end));
    }
    payloads.push(Buffer.from(raw, "latin1"));
  }
  return payloads;
}

function extractPdfTextSync(buffer) {
  const source = buffer.toString("latin1");
  const collected = [];
  for (const payload of extractStreamPayloads(source)) {
    const inflated = inflatePdfStream(payload);
    collected.push(...stringsFromContentStream(inflated));
  }
  if (collected.length < 8) collected.push(...stringsFromContentStream(source));
  return collected.join(" ").replace(/\s+/g, " ").trim();
}

function buildUncompressedPdf(text) {
  const stream = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let body = "%PDF-1.1\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj;
  }
  const xrefStart = body.length;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body, "latin1");
}

function buildFlatePdf(text) {
  const raw = `BT /F1 12 Tf 72 720 Td (${text}) Tj ET`;
  const compressed = zlib.deflateSync(Buffer.from(raw, "latin1"));
  const streamBody = compressed.toString("latin1");
  const contentObj = `4 0 obj\n<< /Length ${compressed.length} /Filter /FlateDecode >>\nstream\n${streamBody}\nendstream\nendobj\n`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    contentObj,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];
  let body = "%PDF-1.1\n";
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(body.length);
    body += obj;
  }
  const xrefStart = body.length;
  let xref = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  body += `${xref}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return Buffer.from(body, "latin1");
}

const jessicaProfile = {
  fullName: "Jessica V",
  jobTitle: "Brand Equity Consultant",
  summary:
    "Brand strategist focused on stakeholder equity, market positioning, and executive visibility for growth-stage companies.",
  workExperience: [
    {
      role: "Brand Equity Consultant",
      company: "Independent",
      description: "Led brand architecture and go-to-market narratives for founders and sales organizations.",
    },
  ],
};

const metadataOnly = {
  fileName: "Jessica_Resume.pdf",
  fileSize: 184320,
  fileType: "application/pdf",
  uploadedAt: "2026-09-08T12:00:00.000Z",
};

const demoResume = {
  fullName: "MD Sifat Islam",
  jobTitle: "Senior Full Stack Developer",
  email: "sifat70640@gmail.com",
  summary: "Passionate Full Stack Developer with 5+ years of experience building high-performance web applications.",
};

const blankResume = {
  fullName: "",
  jobTitle: "",
  summary: "",
  workExperience: [],
};

console.log("\n=== Suite 1: Resume usability gate (Jessica bug) ===");
assert(!isUsable(metadataOnly), "Metadata-only PDF upload is NOT usable");
assert(!isUsable(demoResume), "Demo Full Stack template is NOT usable");
assert(!isUsable(blankResume), "Blank builder resume is NOT usable");
assert(!isUsable({ raw_text: PLACEHOLDER }), "Portal placeholder text is NOT usable");
assert(!isUsable(null), "Missing CV is NOT usable");
assert(isUsable(jessicaProfile), "Jessica Brand Equity profile IS usable");
assert(
  isUsable({
    raw_text:
      "Jessica V is a Brand Equity Consultant with ten years in sales, marketing, and stakeholder branding for enterprise clients.",
  }),
  "Extracted Brand Equity PDF text IS usable"
);
assert(
  !getText(metadataOnly).toLowerCase().includes("backend"),
  "Metadata-only CV does not contain Backend Developer"
);
assert(
  getText(jessicaProfile).toLowerCase().includes("brand equity"),
  "Jessica profile text contains Brand Equity, not engineering"
);

console.log("\n=== Suite 2: PDF text extraction ===");
const jessicaLine =
  "Jessica V Brand Equity Consultant with ten years in marketing sales and stakeholder branding";
const uncompressed = buildUncompressedPdf(jessicaLine);
const uncompressedText = extractPdfTextSync(uncompressed);
assert(
  uncompressedText.toLowerCase().includes("brand equity"),
  "Uncompressed PDF extracts Brand Equity text",
  `got: "${uncompressedText.slice(0, 120)}"`
);
assert(
  !uncompressedText.toLowerCase().includes("backend developer"),
  "Uncompressed PDF does not invent Backend Developer"
);

const flate = buildFlatePdf(jessicaLine);
const flateText = extractPdfTextSync(flate);
assert(
  flateText.toLowerCase().includes("brand equity"),
  "FlateDecode PDF extracts Brand Equity text",
  `got: "${flateText.slice(0, 120)}"`
);

const emptyPdf = buildUncompressedPdf("Hi");
const emptyText = extractPdfTextSync(emptyPdf);
assert(
  emptyText.replace(/\s+/g, "").length < 80,
  "Tiny PDF is treated as insufficient for screening"
);

console.log("\n=== Suite 3: Source contracts still present ===");
const screeningSrc = fs.readFileSync(path.join(root, "src/modules/screening/screening.service.ts"), "utf8");
const applySrc = fs.readFileSync(path.join(root, "src/modules/application/application.service.ts"), "utf8");
const cvServiceSrc = fs.readFileSync(path.join(root, "src/modules/cv/cv.service.ts"), "utf8");
const applyModalSrc = fs.readFileSync(
  path.join(root, "../iformat/src/features/jobs/components/apply-modal.tsx"),
  "utf8"
);
const dashSrc = fs.readFileSync(
  path.join(root, "../iformat/src/features/dashboard/components/candidate-applications-list.tsx"),
  "utf8"
);
const resumeTypesSrc = fs.readFileSync(
  path.join(root, "../iformat/src/features/job-assistant/types/resume.types.ts"),
  "utf8"
);

assert(screeningSrc.includes("INSUFFICIENT_RESUME"), "Screening service gates unreadable CVs");
assert(screeningSrc.includes("Never invent a job title"), "Screening prompt forbids invented professions");
assert(applySrc.includes("assertCandidateResume"), "Apply rejects unreadable CVs");
assert(applySrc.includes("replaceResume"), "Candidate can replace resume on existing application");
assert(cvServiceSrc.includes("raw_text"), "PDF upload stores extracted resume text");
assert(applyModalSrc.includes("uploadPdf"), "Apply modal uploads PDF via parse endpoint");
assert(!applyModalSrc.includes("fileName: uploadedFile.name"), "Apply modal no longer stores filename-only CV");
assert(dashSrc.includes("replaceApplicationResume"), "Dashboard exposes resume replace for Jessica");
assert(resumeTypesSrc.includes("BLANK_RESUME"), "Resume builder default is blank, not developer demo");
assert(!resumeTypesSrc.includes("export const DEFAULT_RESUME"), "Old DEFAULT_RESUME developer seed is gone");

console.log("\n=== Suite 4: Residual product risks ===");
const hasFalsePositiveFallback =
  screeningSrc.includes("bedrock-fallback") && screeningSrc.includes("score: 85");
if (hasFalsePositiveFallback) {
  console.log(
    "  ⚠️  WARN  If the AI microservice is down after a valid resume is attached, screening still writes 85% RECOMMEND. That is not Jessica's original bug, but it can still produce a misleading score."
  );
}

console.log("\n==================================================");
console.log(`QA RESULT  passed=${passed}  failed=${failed}`);
if (failures.length) {
  console.log("Failures:");
  for (const f of failures) console.log(" - " + f);
}
console.log("==================================================\n");
process.exit(failed ? 1 : 0);
