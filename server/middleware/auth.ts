require("dotenv").config();
import { catchAsyncError } from "../utils/CatchAsyncError";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis";

// load env variables
// dotenv.config();

// isAuthenticated Middleware is checking whether user is logged in or not & if logged in then it attach the user present in redis db to request object.

//This middleware will be executed for protected routes i.e, for the routes which is accessd by only a loggedin user e.g, login route, getUserInfo route, updateUserInfo route to access these routes user should be loggedin.
export const isAuthenticated = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  // extract access token from cookies
  const access_token = req.cookies.access_token as string;

  // If access token is not present
  if (!access_token) {
    return next(new ErrorHandler("Please login to access this resource", 400));
  }

  // If access token is present, then verify the token & extract the decoded object
  const decoded = jwt.verify(
    access_token,
    process.env.ACCESS_TOKEN as string
  ) as JwtPayload;

  // If access token is not valid
  if (!decoded) {
    return next(new ErrorHandler("Access token is not valid", 400));
  }

  // If access token is valid then extract user from redis with user._id present in decoded object
  const user = await redis.get(decoded.id);

  // if user is not present
  if (!user) {
    return next(new ErrorHandler("User not found", 400));
  }

  // if user is present then add user in request object
  req.user = JSON.parse(user);

  next();
});

// validate user role
export const authorizedRoles = function (...roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role ${req.user?.role} is not allowed to access this resource`,
          400
        )
      );
    }
    next();
  };
};
