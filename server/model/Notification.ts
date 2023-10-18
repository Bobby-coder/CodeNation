import mongoose, { Model, Schema } from "mongoose";

export interface INotification extends Document {
  title: string;
  message: string;
  status: string;
  userId: string;
}

// create Notification schema
const notificationSchema = new Schema<INotification>({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "unread",
  },
});

// create Notification model
const Notification: Model<INotification> = mongoose.model(
  "Notification",
  notificationSchema
);
export default Notification;
