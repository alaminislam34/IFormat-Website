import { Request } from "express";
import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError, BadRequestError } from "../../errors/index.js";
import { saveUploadedBuffer } from "../../lib/file-storage.js";
import { extractPdfText, isExtractedTextUsable } from "../../utils/pdf-text.js";
import { logger } from "../../utils/logger.js";

export class CVService {
  static async listUserCVs(userId: string) {
    return prisma.cV.findMany({
      where: { userId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async getCVById(cvId: string, userId: string) {
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    });

    if (!cv) throw new NotFoundError("CV", cvId);
    if (cv.userId !== userId) throw new ForbiddenError("You do not own this CV");

    return cv;
  }

  static async createCV(userId: string, input: { title?: string; content: any }) {
    const cv = await prisma.cV.create({
      data: {
        userId,
        title: input.title || "My Resume",
        versions: {
          create: {
            versionNumber: 1,
            content: input.content,
          },
        },
      },
      include: {
        versions: true,
      },
    });

    return cv;
  }

  static async createFromUploadedPdf(
    userId: string,
    file: Express.Multer.File,
    options: { title?: string; req?: Request } = {}
  ) {
    if (!file?.buffer) {
      throw new BadRequestError("Please upload a PDF resume file");
    }

    const mime = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();
    if (mime !== "application/pdf" && !name.endsWith(".pdf")) {
      throw new BadRequestError("Only PDF resumes are supported. Please upload a .pdf file.");
    }

    let rawText = "";
    try {
      rawText = await extractPdfText(file.buffer);
    } catch (error) {
      logger.warn("PDF text extraction note for uploaded resume:", error);
    }

    if (!rawText || rawText.trim().length === 0) {
      rawText = `Uploaded PDF Resume: ${file.originalname || "Candidate CV"}`;
    }

    const stored = await saveUploadedBuffer({
      buffer: file.buffer,
      originalName: file.originalname || "resume.pdf",
      mimeType: file.mimetype || "application/pdf",
      prefix: "resume",
      req: options.req,
    });

    return this.createCV(userId, {
      title: options.title || `Resume: ${file.originalname || "Uploaded PDF"}`,
      content: {
        source: "pdf_upload",
        fileName: file.originalname,
        fileSize: file.size,
        fileType: file.mimetype,
        fileUrl: stored.url,
        uploadedAt: new Date().toISOString(),
        parseStatus: "extracted",
        raw_text: rawText,
      },
    });
  }

  static async saveNewVersion(cvId: string, userId: string, content: any) {
    const cv = await prisma.cV.findUnique({
      where: { id: cvId },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 1,
        },
      },
    });

    if (!cv) throw new NotFoundError("CV", cvId);
    if (cv.userId !== userId) throw new ForbiddenError("You do not own this CV");

    const nextVersionNumber = (cv.versions[0]?.versionNumber || 0) + 1;

    const newVersion = await prisma.cVVersion.create({
      data: {
        cvId,
        versionNumber: nextVersionNumber,
        content,
      },
    });

    await prisma.cV.update({
      where: { id: cvId },
      data: { updatedAt: new Date() },
    });

    return newVersion;
  }

  static async deleteCV(cvId: string, userId: string) {
    const cv = await prisma.cV.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError("CV", cvId);
    if (cv.userId !== userId) throw new ForbiddenError("You do not own this CV");

    await prisma.cV.delete({ where: { id: cvId } });
    return true;
  }
}
