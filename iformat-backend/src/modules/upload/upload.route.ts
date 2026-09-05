import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { BadRequestError } from "../../errors/index.js";
import { s3Client } from "../../lib/s3.js";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Ensure local uploads directory exists as reliable local storage fallback
const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for video and image files
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/svg+xml",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/ogg",
      "application/pdf",
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestError(`File type ${file.mimetype} is not supported`));
    }
  },
});

const uploadRouter = Router();

uploadRouter.use(requireAuth);

/**
 * POST /api/v1/upload/media
 * Uploads a single media file (logo, video, or document)
 */
uploadRouter.post(
  "/media",
  upload.single("file"),
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const file = req.file;
    const ext = path.extname(file.originalname) || ".bin";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `media-${uniqueSuffix}${ext}`;
    const s3Key = `uploads/${filename}`;

    let fileUrl = "";

    // 1. Try S3 upload if AWS configured
    if (
      env.AWS_ACCESS_KEY_ID &&
      env.AWS_ACCESS_KEY_ID !== "mock" &&
      env.AWS_SECRET_ACCESS_KEY &&
      env.AWS_SECRET_ACCESS_KEY !== "mock"
    ) {
      try {
        const command = new PutObjectCommand({
          Bucket: env.AWS_S3_BUCKET,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await s3Client.send(command);
        fileUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${s3Key}`;
        logger.info(`✅ File uploaded to S3: ${fileUrl}`);
      } catch (s3Error) {
        logger.warn("S3 upload failed, falling back to local file storage:", s3Error);
      }
    }

    // 2. Fallback to local file storage
    if (!fileUrl) {
      const localFilePath = path.join(uploadsDir, filename);
      fs.writeFileSync(localFilePath, file.buffer);
      const host = req.get("host") || `localhost:${env.PORT}`;
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      fileUrl = `${protocol}://${host}/uploads/${filename}`;
      logger.info(`✅ File saved locally: ${fileUrl}`);
    }

    return ApiResponse.success(res, "File uploaded successfully", {
      url: fileUrl,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  }
);

export { uploadRouter };
