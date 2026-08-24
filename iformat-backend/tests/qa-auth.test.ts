/**
 * Production-Grade Authentication QA & Security Test Suite
 * Tests Password Hashing, JWT Lifecycle, Sanitization, Zod Validation, and Field Error Mapping.
 */

import { hashPassword, comparePassword } from "../src/utils/password.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/utils/token.js";
import { sanitizeUser } from "../src/modules/auth/auth.service.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "../src/modules/auth/auth.validation.js";
import {
  ValidationError,
  ConflictError,
  AuthError,
} from "../src/errors/index.js";
import { Role } from "@prisma/client";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, failureDetail?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${testName} - ${failureDetail || "Assertion failed"}`);
    failedCount++;
  }
}

async function runQATests() {
  console.log("\n🧪 ========================================================");
  console.log("   iFormat Authentication & Security QA Test Suite");
  console.log("========================================================\n");

  // 1. Password Hashing & Bcrypt Security Tests
  console.log("🔒 [Suite 1: Password Hashing & Cryptography]");
  const plainPassword = "SuperSecurePassword123!";
  const hash = await hashPassword(plainPassword);

  assert(
    typeof hash === "string" && hash.startsWith("$2"),
    "Password hashes to valid Bcrypt salt structure"
  );
  assert(
    hash !== plainPassword,
    "Hashed password does NOT match raw plaintext password"
  );

  const isValidMatch = await comparePassword(plainPassword, hash);
  assert(isValidMatch, "Bcrypt correctly verifies valid plaintext password against hash");

  const isInvalidMatch = await comparePassword("WrongPassword123!", hash);
  assert(!isInvalidMatch, "Bcrypt strictly rejects incorrect plaintext password");

  // 2. JWT Access & Refresh Token Lifecycle Tests
  console.log("\n🔑 [Suite 2: JWT Access & Refresh Token Management]");
  const payload = {
    userId: "test-user-uuid-12345",
    email: "qa.tester@iformat.io",
    role: Role.CANDIDATE,
    tokenVersion: 1,
  };

  const accessToken = signAccessToken(payload);
  assert(
    typeof accessToken === "string" && accessToken.split(".").length === 3,
    "Generates well-formed 3-part Access Token JWT"
  );

  const decodedAccess = verifyAccessToken(accessToken);
  assert(
    decodedAccess.userId === payload.userId &&
      decodedAccess.email === payload.email &&
      decodedAccess.tokenVersion === 1,
    "Access Token signature and payload decoded accurately"
  );

  const refreshToken = signRefreshToken(payload);
  assert(
    typeof refreshToken === "string" && refreshToken.split(".").length === 3,
    "Generates well-formed 3-part Refresh Token JWT"
  );

  const decodedRefresh = verifyRefreshToken(refreshToken);
  assert(
    decodedRefresh.userId === payload.userId &&
      decodedRefresh.tokenVersion === payload.tokenVersion,
    "Refresh Token signature and session tokenVersion verified"
  );

  let tamperedTokenRejected = false;
  try {
    verifyAccessToken(accessToken + "tampered");
  } catch {
    tamperedTokenRejected = true;
  }
  assert(tamperedTokenRejected, "Strictly rejects tampered JWT signature");

  // 3. Zero Password Leakage & Sanitization Tests
  console.log("\n🛡️ [Suite 3: Zero Password Leakage & Sanitization Audit]");
  const dirtyUserObject = {
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    role: Role.EMPLOYER,
    passwordHash: "$2b$12$eX4mPL3H4sHNotToBeExposedInAnyResponse",
    rawPassword: "MySecretPassword123",
    tokenVersion: 5,
    avatarUrl: "https://avatar.com/pic.jpg",
    phone: "+1234567890",
    emailVerified: true,
    companyName: "Acme Corp",
    companyWebsite: "https://acme.com",
    companyDescription: "Hiring Top Talent",
    companyLogoUrl: "https://acme.com/logo.png",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cleanUser = sanitizeUser(dirtyUserObject);
  assert(
    !("passwordHash" in cleanUser),
    "Sanitized user object has ZERO passwordHash field"
  );
  assert(
    !("rawPassword" in cleanUser),
    "Sanitized user object has ZERO rawPassword field"
  );
  assert(
    !("tokenVersion" in cleanUser),
    "Sanitized user object does NOT leak internal session tokenVersion"
  );
  assert(
    cleanUser.email === "john@example.com" && cleanUser.name === "John Doe",
    "Preserves public profile fields (name, email, role, company details)"
  );

  // 4. Zod Validation & Schema Edge Cases
  console.log("\n📋 [Suite 4: Request Validation Schemas & Edge Cases]");

  // Register Schema
  const validRegister = registerSchema.safeParse({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "securepassword",
    role: Role.CANDIDATE,
  });
  assert(validRegister.success, "RegisterSchema accepts valid candidate registration");

  const invalidEmailRegister = registerSchema.safeParse({
    name: "Jane Doe",
    email: "not-an-email",
    password: "securepassword",
  });
  assert(!invalidEmailRegister.success, "RegisterSchema rejects invalid email format");

  const shortPasswordRegister = registerSchema.safeParse({
    name: "Jane Doe",
    email: "jane@example.com",
    password: "123",
  });
  assert(!shortPasswordRegister.success, "RegisterSchema rejects password shorter than 6 characters");

  // Login Schema
  const validLogin = loginSchema.safeParse({
    email: "jane@example.com",
    password: "securepassword",
  });
  assert(validLogin.success, "LoginSchema accepts valid credentials payload");

  // OTP Schema
  const validOtp = verifyOtpSchema.safeParse({
    email: "jane@example.com",
    code: "123456",
  });
  assert(validOtp.success, "VerifyOtpSchema accepts valid 6-digit OTP");

  const invalidOtpLength = verifyOtpSchema.safeParse({
    email: "jane@example.com",
    code: "123",
  });
  assert(!invalidOtpLength.success, "VerifyOtpSchema rejects OTP with length != 6");

  // Reset Password Schema (Dual Mode)
  const tokenReset = resetPasswordSchema.safeParse({
    token: "valid-jwt-reset-token",
    password: "brandnewpassword",
  });
  assert(tokenReset.success, "ResetPasswordSchema accepts magic link token mode");

  const otpReset = resetPasswordSchema.safeParse({
    email: "jane@example.com",
    code: "654321",
    password: "brandnewpassword",
  });
  assert(otpReset.success, "ResetPasswordSchema accepts 6-digit OTP reset mode");

  const emptyReset = resetPasswordSchema.safeParse({
    password: "brandnewpassword",
  });
  assert(!emptyReset.success, "ResetPasswordSchema rejects reset without either token or email+OTP");

  // 5. Error Structure & Field Error Attachment
  console.log("\n🎯 [Suite 5: Structured Error Mapping & Response Integrity]");
  const conflictErr = new ConflictError("An account with this email already exists", [
    { field: "email", message: "An account with this email already exists" },
  ]);
  assert(
    conflictErr.statusCode === 409 &&
      Array.isArray(conflictErr.errors) &&
      conflictErr.errors[0].field === "email",
    "ConflictError properly attaches { field: 'email' } for inline UI highlighting"
  );

  const authErr = new AuthError("Invalid email or password", [
    { field: "password", message: "Invalid email or password" },
  ]);
  assert(
    authErr.statusCode === 401 &&
      authErr.errors[0].field === "password",
    "AuthError properly attaches { field: 'password' } for inline UI highlighting"
  );

  // Summary
  console.log("\n========================================================");
  console.log(`📊 QA TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("========================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runQATests();
