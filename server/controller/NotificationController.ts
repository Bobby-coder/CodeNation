import { Request, Response, NextFunction } from "express";
import { catchAsyncError } from "../utils/CatchAsyncError";
import Notification from "../model/Notification";
import ErrorHandler from "../utils/ErrorHandler";
import cron from "node-cron";

// get all notification
export const getAllNotifications = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // fetch all notification documents & sort them by lateset date
    const notifications = await Notification.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications,
      },
    });
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// update notification status - only admin can update
export const updateNotificationStatus = catchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const notificationId = req.params.id;

    const notification = await Notification.findById(notificationId);

    // if notification not found
    if (!notification) {
      return next(new ErrorHandler("Notification not found", 400));
    }

    // if notification found then update its status
    notification.status ? (notification.status = "read") : notification.status;

    // save changes to db
    await notification?.save();

    // fetch all notifications with updated status and send them in response
    await getAllNotifications(req, res, next);
  } catch (err: any) {
    return next(new ErrorHandler(err.message, 400));
  }
});

// delete read notification after 30 days using cron npm package
cron.schedule("0 0 0 * * *", async () => {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  await Notification.deleteMany({
    status: "read",
    createdAt: { $lt: thirtyDaysAgo },
  });
});
