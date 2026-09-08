import { Router } from "express";
import multer from "multer";
import { CVController } from "./cv.controller.js";
import { createCVSchema, saveVersionSchema } from "./cv.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { BadRequestError } from "../../errors/index.js";

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();
    if (mime === "application/pdf" || name.endsWith(".pdf")) {
      cb(null, true);
      return;
    }
    cb(new BadRequestError("Only PDF files are supported for resume upload"));
  },
});

const router = Router();

router.use(requireAuth);

router.get("/", catchAsync(CVController.list));
router.post(
  "/upload-pdf",
  pdfUpload.single("file"),
  catchAsync(CVController.uploadPdf)
);
router.get("/:id", catchAsync(CVController.getById));
router.post(
  "/",
  validate({ body: createCVSchema }),
  catchAsync(CVController.create)
);
router.post(
  "/:id/versions",
  validate({ body: saveVersionSchema }),
  catchAsync(CVController.saveVersion)
);
router.delete("/:id", catchAsync(CVController.delete));

export const cvRouter = router;
