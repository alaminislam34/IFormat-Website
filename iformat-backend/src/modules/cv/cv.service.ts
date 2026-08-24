import { prisma } from "../../lib/prisma.js";
import { NotFoundError, ForbiddenError } from "../../errors/index.js";

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
