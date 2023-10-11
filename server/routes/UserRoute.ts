import express from "express";
import {
  activateUser,
  loginUser,
  logoutUser,
  registerUser,
} from "../controller/UserController";

const userRouter = express.Router();

userRouter.post("/register", registerUser);

userRouter.post("/activation", activateUser);

userRouter.get("/login", loginUser);

userRouter.post("/logout", logoutUser);

export default userRouter;
