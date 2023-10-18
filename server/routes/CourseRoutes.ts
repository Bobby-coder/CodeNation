import express from "express";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";
import {
  addAnswer,
  addQuestion,
  addReplyToReview,
  addReview,
  deleteCourse,
  editCourse,
  getAllCourses,
  getAllCoursesForAdmin,
  getFullCourseContent,
  getLimitedCourseContent,
  uploadCourse,
} from "../controller/CouseController";

const courseRouter = express.Router();

courseRouter.post(
  "/create",
  isAuthenticated,
  authorizedRoles("admin"),
  uploadCourse
);

courseRouter.put(
  "/edit/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  editCourse
);

courseRouter.get("/limited-course-content/:id", getLimitedCourseContent);

courseRouter.get("/get-courses", getAllCourses);

courseRouter.get(
  "/full-course-content/:id",
  isAuthenticated,
  getFullCourseContent
);

courseRouter.get(
  "/all-courses",
  isAuthenticated,
  authorizedRoles("admin"),
  getAllCoursesForAdmin
);

courseRouter.put("/add-question", isAuthenticated, addQuestion);

courseRouter.put("/add-answer", isAuthenticated, addAnswer);

courseRouter.put("/add-review/:id", isAuthenticated, addReview);

courseRouter.put(
  "/add-review-reply",
  isAuthenticated,
  authorizedRoles("admin"),
  addReplyToReview
);

courseRouter.delete(
  "/delete-course/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteCourse
);

export default courseRouter;
