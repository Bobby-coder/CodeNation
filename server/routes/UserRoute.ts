import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsersForAdmin,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  resetPasswordLink,
  socialAuth,
  updateAccessToken,
  updateUserInfo,
  updateUserPassword,
  updateUserProfilePicture,
  updateUserRole,
} from "../controller/UserController";
import { authorizedRoles, isAuthenticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/activation", activateUser);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAuthenticated, logoutUser);

userRouter.get("/refresh", updateAccessToken);

userRouter.get("/me", isAuthenticated, getUserInfo);

userRouter.post("/social-auth", socialAuth);

userRouter.put("/update-user-info", isAuthenticated, updateUserInfo);

userRouter.put("/update-user-password", isAuthenticated, updateUserPassword);

userRouter.put(
  "/update-user-profile-picture",
  isAuthenticated,
  updateUserProfilePicture
);

userRouter.post("/reset-password", resetPasswordLink);

userRouter.put("/update-password", resetPassword);

userRouter.get(
  "/all-users",
  isAuthenticated,
  authorizedRoles("admin"),
  getAllUsersForAdmin
);

userRouter.put(
  "/update-role",
  isAuthenticated,
  authorizedRoles("admin"),
  updateUserRole
);

userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizedRoles("admin"),
  deleteUser
);

export default userRouter;
