import { Router } from "express";
import { UserController } from "./user.controller.js";
import {
  updateProfileSchema,
  updateRoleSchema,
  updateCompanyProfileSchema,
} from "./user.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.use(requireAuth);

router.get("/me", catchAsync(UserController.getMe));

router.patch(
  "/me",
  validate({ body: updateProfileSchema }),
  catchAsync(UserController.updateMe)
);

router.post(
  "/role",
  validate({ body: updateRoleSchema }),
  catchAsync(UserController.updateRole)
);

router.post(
  "/company",
  validate({ body: updateCompanyProfileSchema }),
  catchAsync(UserController.updateCompany)
);

router.patch(
  "/company",
  validate({ body: updateCompanyProfileSchema }),
  catchAsync(UserController.updateCompany)
);

export const userRouter = router;
