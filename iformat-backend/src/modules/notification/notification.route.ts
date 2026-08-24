import { Router } from "express";
import { NotificationController } from "./notification.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.use(requireAuth);

router.get("/", catchAsync(NotificationController.getMyNotifications));
router.patch("/:id/read", catchAsync(NotificationController.markRead));
router.post("/read-all", catchAsync(NotificationController.markAllRead));

export const notificationRouter = router;
