import { NextFunction, Response } from "express";
import Order from "../model/Order";

export const saveOrder = async function (
  data: any,
  res: Response,
  course: any
) {
  await Order.create(data);

  return res.status(200).json({
    success: true,
    message: "Order placed successfully",
    data: {
      order: course,
    },
  });
};

// fetch all orders
export const getAllOrdersService = async function (res: Response) {
  const orders = await Order.find().sort({ createdAt: -1 });

  return res.status(201).json({
    success: true,
    message: "All orders fetched successfully",
    data: {
      orders,
    },
  });
};
