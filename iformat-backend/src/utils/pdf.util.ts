import fs from "fs/promises";
import path from "path";
import { Response } from "express";

/**
 * Utility functions for handling Base64 PDF data on the Node.js backend
 */

/**
 * Converts a Base64 PDF string into a Node.js Buffer
 */
export function base64ToPdfBuffer(base64Data: string): Buffer {
  const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
  return Buffer.from(cleanBase64, "base64");
}

/**
 * Converts a PDF Buffer into a Base64 string
 */
export function pdfBufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/**
 * Saves a Base64-encoded PDF to local disk
 */
export async function saveBase64PdfToDisk(base64Data: string, destinationPath: string): Promise<string> {
  const buffer = base64ToPdfBuffer(base64Data);
  await fs.mkdir(path.dirname(destinationPath), { recursive: true });
  await fs.writeFile(destinationPath, buffer);
  return destinationPath;
}

/**
 * Sends a Base64-encoded PDF as an HTTP binary attachment response in Express
 */
export function streamBase64PdfAsDownload(
  res: Response,
  base64Data: string,
  fileName: string = "document.pdf"
): void {
  const buffer = base64ToPdfBuffer(base64Data);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.setHeader("Content-Length", buffer.length);
  res.send(buffer);
}
