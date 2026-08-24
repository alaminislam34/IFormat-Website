import { prisma } from "../../lib/prisma.js";
import { Role } from "@prisma/client";
import { signAccessToken, signRefreshToken } from "../../utils/token.js";
import { AuthError } from "../../errors/index.js";

export interface SocialProfileInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export class OAuthService {
  /**
   * Handles Google & Social OAuth profile verification, auto-linking,
   * and dual JWT token generation.
   */
  static async handleSocialProfile(input: SocialProfileInput) {
    const email = input.email.trim().toLowerCase();

    if (!email) {
      throw new AuthError("Social provider did not return a valid email address");
    }

    // 1. Check if this OAuth Provider + Account ID already exists
    const existingOAuth = await prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: input.provider,
          providerAccountId: input.providerAccountId,
        },
      },
      include: { user: true },
    });

    if (existingOAuth && existingOAuth.user) {
      const user = existingOAuth.user;

      // Update avatar if not present
      if (!user.avatarUrl && input.avatarUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: input.avatarUrl },
        });
      }

      const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      const refreshToken = signRefreshToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion,
      });

      return { user, accessToken, refreshToken, isNewUser: false };
    }

    // 2. Check if a User already exists with this email (e.g. registered via password)
    let user = await prisma.user.findUnique({
      where: { email },
    });

    let isNewUser = false;

    if (user) {
      // Auto-link the new OAuth provider to this existing user
      await prisma.$transaction([
        prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider: input.provider,
            providerAccountId: input.providerAccountId,
          },
        }),
        prisma.user.update({
          where: { id: user.id },
          data: {
            emailVerified: true, // Google verifies email ownership
            avatarUrl: user.avatarUrl || input.avatarUrl,
          },
        }),
      ]);

      // Refetch user
      user = (await prisma.user.findUnique({ where: { id: user.id } })) || user;
    } else {
      // Create new user & link OAuthAccount in one atomic transaction
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          name: input.name || "Google User",
          email,
          avatarUrl: input.avatarUrl,
          emailVerified: true, // Trusted from Google
          role: Role.CANDIDATE, // Default role for new users
          oauthAccounts: {
            create: {
              provider: input.provider,
              providerAccountId: input.providerAccountId,
            },
          },
        },
      });
    }

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    });

    return { user, accessToken, refreshToken, isNewUser };
  }
}
