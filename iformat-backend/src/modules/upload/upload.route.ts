import { Router, Request, Response } from "express";
import multer from "multer";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { BadRequestError } from "../../errors/index.js";
import { saveUploadedBuffer } from "../../lib/file-storage.js";
import { catchAsync } from "../../utils/catchAsync.js";

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
  catchAsync(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new BadRequestError("No file uploaded");
    }

    const file = req.file;
    const stored = await saveUploadedBuffer({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      prefix: "media",
      req,
    });

    return ApiResponse.success(res, "File uploaded successfully", {
      url: stored.url,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  })
);

export { uploadRouter };
