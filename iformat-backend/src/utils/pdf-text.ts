import zlib from "node:zlib";
import { logger } from "./logger.js";

const MIN_USABLE_CHARS = 80;

function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_match, oct) => String.fromCharCode(parseInt(oct, 8)))
    .replace(/#([0-9A-Fa-f]{2})/g, (_match, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function stringsFromContentStream(decoded: string): string[] {
  const parts: string[] = [];

  for (const match of decoded.matchAll(/\((?:\\.|[^\\)])*\)/g)) {
    const inner = match[0].slice(1, -1);
    const text = decodePdfLiteral(inner).trim();
    if (text.length >= 2 && /[A-Za-z]/.test(text)) {
      parts.push(text);
    }
  }

  for (const match of decoded.matchAll(/\[(.*?)\]\s*TJ/gs)) {
    for (const innerMatch of match[1].matchAll(/\((?:\\.|[^\\)])*\)/g)) {
      const inner = innerMatch[0].slice(1, -1);
      const text = decodePdfLiteral(inner).trim();
      if (text) parts.push(text);
    }
  }

  return parts;
}

function inflatePdfStream(payload: Buffer): string {
  const attempts: Array<(buf: Buffer) => Buffer> = [
    (buf) => zlib.inflateSync(buf),
    (buf) => zlib.unzipSync(buf),
    (buf) => zlib.inflateRawSync(buf),
  ];

  for (const attempt of attempts) {
    try {
      return attempt(payload).toString("latin1");
    } catch {
      // try next decoder
    }
  }

  return payload.toString("latin1");
}

function stripStreamEol(data: string): string {
  if (data.endsWith("\r\n")) return data.slice(0, -2);
  if (data.endsWith("\n") || data.endsWith("\r")) return data.slice(0, -1);
  return data;
}

function extractStreamPayloads(source: string): Buffer[] {
  const payloads: Buffer[] = [];
  const headerRe = /<<([\s\S]*?)>>\s*stream(\r\n|\n|\r)?/g;
  let match: RegExpExecArray | null;

  while ((match = headerRe.exec(source)) !== null) {
    const dict = match[1];
    const dataStart = match.index + match[0].length;
    const lengthMatch = dict.match(/\/Length\s+(\d+)/);
    let raw: string;

    if (lengthMatch) {
      const length = Number(lengthMatch[1]);
      raw = source.slice(dataStart, dataStart + length);
    } else {
      const end = source.indexOf("endstream", dataStart);
      if (end < 0) continue;
      raw = stripStreamEol(source.slice(dataStart, end));
    }

    payloads.push(Buffer.from(raw, "latin1"));
  }

  return payloads;
}

/**
 * Lightweight PDF text extraction (Length-accurate streams + FlateDecode + Tj/TJ literals).
 * Used so uploaded resumes can be scored without a native parser package.
 */
export function extractPdfTextSync(buffer: Buffer): string {
  const source = buffer.toString("latin1");
  const collected: string[] = [];

  for (const payload of extractStreamPayloads(source)) {
    const inflated = inflatePdfStream(payload);
    collected.push(...stringsFromContentStream(inflated));
    if (inflated !== payload.toString("latin1")) {
      collected.push(...stringsFromContentStream(payload.toString("latin1")));
    }
  }

  if (collected.length < 8) {
    collected.push(...stringsFromContentStream(source));
  }

  return collected
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const text = extractPdfTextSync(buffer);
    if (isExtractedTextUsable(text)) {
      return text;
    }
    logger.warn(
      `PDF extraction produced only ${text.length} usable characters; treating as unreadable`
    );
    return text;
  } catch (error) {
    logger.error("PDF text extraction failed:", error);
    throw error;
  }
}

export function isExtractedTextUsable(text: string): boolean {
  return text.replace(/\s+/g, "").length >= MIN_USABLE_CHARS;
}
