import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../utils/CatchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import Course from "../model/Course";
import { User } from "../model/User";
import { getAllOrdersService, saveOrder } from "../services/OrderService";
import sendMail from "../utils/SendMail";
import Notification from "../model/Notification";

// create order
export const createOrder = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { courseId, paymentInfo } = req.body;

    const userId = req.user?._id;

    const user = await User.findById(userId);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 400));
    }

    // if course is already purchased
    const isCoursePurchased = user?.courses.find(
      (currCourse: any) => currCourse._id.toString() === courseId
    );

    if (isCoursePurchased) {
      return next(
        new ErrorHandler("You have already purchased this course", 400)
      );
    }

    // describle order object
    const orderData: any = {
      courseId,
      userId: user?._id,
      paymentInfo,
    };

    // template data
    const templateData = {
      id: course._id.toString().slice(0, 6),
      courseName: course.name,
      price: course.price,
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };

    // send mail
    try {
      await sendMail({
        userEmail: user?.email,
        subject: "Order Confirmed",
        templateName: "order-confirmed.ejs",
        templateData,
      });
    } catch (err: any) {
      return next(new ErrorHandler(err.message, 400));
    }

    // add course to courses
    user?.courses.push(course._id);

    // save changes to user document
    await user?.save();

    // update purchased count
    course.purchased ? (course.purchased += 1) : course.purchased;

    // save changes to course document
    await course?.save();

    // create notification for the order
    await Notification.create({
      user: user?._id,
      title: "New order",
      message: `You have a new order for ${course?.name} from ${user?.name}`,
    });

    // create order & return success response
    await saveOrder(orderData, res, course);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// get all orders for admin only
export const getAllOrders = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    getAllOrdersService(res);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});
