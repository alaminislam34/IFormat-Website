import { Router } from "express";
import { CVController } from "./cv.controller.js";
import { createCVSchema, saveVersionSchema } from "./cv.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.use(requireAuth);

router.get("/", catchAsync(CVController.list));
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
