import { prisma } from "../../lib/prisma.js";
import { Role } from "@prisma/client";
import { NotFoundError } from "../../errors/index.js";

export class UserService {
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
        companyName: true,
        companyWebsite: true,
        companyDescription: true,
        companyLogoUrl: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundError("User", userId);
    return user;
  }

  static async updateProfile(userId: string, input: { name?: string; phone?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        avatarUrl: true,
      },
    });

    return user;
  }

  static async updateRole(userId: string, role: Role) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return user;
  }

  static async updateCompanyProfile(
    userId: string,
    input: {
      companyName: string;
      companyWebsite?: string;
      companyDescription?: string;
      companyLogoUrl?: string;
    }
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        role: Role.EMPLOYER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyName: true,
        companyWebsite: true,
        companyDescription: true,
        companyLogoUrl: true,
      },
    });

    return user;
  }
}
