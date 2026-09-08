import path from "path";
import fs from "fs";
import { Request } from "express";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./s3.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface StoredFile {
  url: string;
  storedName: string;
}

const isS3Configured = () =>
  Boolean(
    env.AWS_ACCESS_KEY_ID &&
      env.AWS_ACCESS_KEY_ID !== "mock" &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_SECRET_ACCESS_KEY !== "mock"
  );

/**
 * Persist an uploaded buffer to S3 when configured, otherwise local /uploads.
 */
export async function saveUploadedBuffer(params: {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  prefix?: string;
  req?: Request;
}): Promise<StoredFile> {
  const { buffer, originalName, mimeType, prefix = "media", req } = params;
  const ext = path.extname(originalName) || ".bin";
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const storedName = `${prefix}-${uniqueSuffix}${ext}`;
  const s3Key = `uploads/${storedName}`;

  if (isS3Configured()) {
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: s3Key,
          Body: buffer,
          ContentType: mimeType,
        })
      );
      const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;
      logger.info(`✅ File uploaded to S3: ${url}`);
      return { url, storedName };
    } catch (s3Error) {
      logger.warn("S3 upload failed, falling back to local file storage:", s3Error);
    }
  }

  const localFilePath = path.join(uploadsDir, storedName);
  fs.writeFileSync(localFilePath, buffer);
  const host = req?.get("host") || `localhost:${env.PORT}`;
  const forwardedProto = req?.headers?.["x-forwarded-proto"];
  const protocol =
    req?.protocol === "https" || forwardedProto === "https" ? "https" : "http";
  const url = `${protocol}://${host}/uploads/${storedName}`;
  logger.info(`✅ File saved locally: ${url}`);
  return { url, storedName };
}
