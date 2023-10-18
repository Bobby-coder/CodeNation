import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import {
  getCourseAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} from "../controller/analyticsController";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/user-analytics",
  isAuthenticated,
  authorizedRoles("admin"),
  getUserAnalytics
);

analyticsRouter.get(
  "/course-analytics",
  isAuthenticated,
  authorizedRoles("admin"),
  getCourseAnalytics
);

analyticsRouter.get(
  "/order-analytics",
  isAuthenticated,
  authorizedRoles("admin"),
  getOrderAnalytics
);

export default analyticsRouter;
