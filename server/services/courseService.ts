import { Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import Course from "../model/Course";
import { catchAsyncError } from "../utils/CatchAsyncError";

export const createCourse = catchAsyncError(async function (
  data: any,
  res: Response,
  next: NextFunction
) {
  try {
    // create course with recieved data
    const course = await Course.create(data);

    // return success response
    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: {
        course,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});
