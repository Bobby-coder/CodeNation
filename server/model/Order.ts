import mongoose, { Model, Schema } from "mongoose";
import { Document } from "mongoose";

export interface IOrder extends Document {
  courseId: string;
  userId: string;
  paymentInfo: Object;
}

// create order schema
const orderSchema = new Schema<IOrder>(
  {
    courseId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: Object,
      //required:true
    },
  },
  { timestamps: true }
);

// create order model
const Order: Model<IOrder> = mongoose.model("Order", orderSchema);
export default Order;
