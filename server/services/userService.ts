import { redis } from "../config/redis";
import ErrorHandler from "../utils/ErrorHandler";
import { NextFunction, Response } from "express";

// fetch user with specified id & send user in response
export const getUserById = async function (
  id: string,
  res: Response,
  next: NextFunction
) {
  try {
    // get user from redis
    const user = await redis.get(id);

    // If user is not present
    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    // If user is present then parse the json user object into js object
    const parsedUser = JSON.parse(user);

    return res.status(201).json({
      success: true,
      message: `User with id:${id} fetched successfully`,
      data: {
        parsedUser,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
};
