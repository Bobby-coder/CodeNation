import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import {
  getAllNotifications,
  updateNotificationStatus,
} from "../controller/NotificationController";

const notificationRouter = express.Router();

notificationRouter.get(
  "/notification/all-notifications",
  isAuthenticated,
  getAllNotifications
);

notificationRouter.put(
  "/notification/update-status/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  updateNotificationStatus
);

export default notificationRouter;
