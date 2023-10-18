import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../utils/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import { User } from "../model/User";
import { generateLast12MonthsData } from "../utils/analyticsGenerator";
import Order from "../model/Order";
import Course from "../model/Course";

// get user analytics
export const getUserAnalytics = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const users = await generateLast12MonthsData(User);

    return res.status(200).json({
      status: true,
      data: {
        users,
      },
    });
  } catch (err: any) {
    return new ErrorHandler(err.message, 500);
  }
});

// get order analytics
export const getOrderAnalytics = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const orders = await generateLast12MonthsData(Order);

    return res.status(200).json({
      status: true,
      data: {
        orders,
      },
    });
  } catch (err: any) {
    return new ErrorHandler(err.message, 500);
  }
});

// get course analytics
export const getCourseAnalytics = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courses = await generateLast12MonthsData(Course);

    return res.status(200).json({
      status: true,
      data: {
        courses,
      },
    });
  } catch (err: any) {
    return new ErrorHandler(err.message, 500);
  }
});
