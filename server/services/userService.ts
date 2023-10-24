import { redis } from "../config/redis";
import { User } from "../model/User";
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
      user: parsedUser,
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
};

// fetch all users
export const getAllUsersService = async function (res: Response) {
  const users = await User.find().sort({ createdAt: -1 });

  return res.status(201).json({
    success: true,
    message: "All users fetched successfully",
    users,
  });
};

// update user Role
export const updateUserRoleService = async function (
  res: Response,
  userId: string,
  role: string
) {
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  return res.status(201).json({
    success: true,
    message: "Role updated successfully",
    updatedUser,
  });
};
