import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load env variables
dotenv.config();

export function cloudinaryConfig() {
  return cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
  });
}
